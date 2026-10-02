// ==========================================================================
// VESTIAI - AI VIRTUAL DRESSING ROOM (Pose Detection & Try-On Engine)
// ==========================================================================

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "../firebase/firebase-config.js";

import { fallbackProducts } from "./products.js";

// =====================================================
// DOM ELEMENTS
// =====================================================
const cameraVideo = document.getElementById("cameraVideo");
const cameraCanvas = document.getElementById("cameraCanvas");
const startCameraButton = document.getElementById("startCameraButton");
const stopCameraButton = document.getElementById("stopCameraButton");
const demoModelButton = document.getElementById("demoModelButton");
const snapPhotoButton = document.getElementById("snapPhotoButton");
const photoUploadInput = document.getElementById("photoUploadInput");
const addToCartTryonBtn = document.getElementById("addToCartTryonBtn");
const buyNowTryonBtn = document.getElementById("buyNowTryonBtn");

const cameraPlaceholder = document.getElementById("cameraPlaceholder");
const cameraStatus = document.getElementById("cameraStatus");
const tryonStatus = document.getElementById("tryonStatus");

const tryonProductImage = document.getElementById("tryonProductImage");
const tryonProductName = document.getElementById("tryonProductName");
const tryonProductCategory = document.getElementById("tryonProductCategory");
const tryonProductPrice = document.getElementById("tryonProductPrice");

const scaleSlider = document.getElementById("scaleSlider");
const scaleVal = document.getElementById("scaleVal");
const offsetSlider = document.getElementById("offsetSlider");
const offsetVal = document.getElementById("offsetVal");
const opacitySlider = document.getElementById("opacitySlider");
const opacityVal = document.getElementById("opacityVal");

const garmentTray = document.getElementById("garmentTray");

const canvasContext = cameraCanvas ? cameraCanvas.getContext("2d") : null;

// =====================================================
// STATE & VARIABLES
// =====================================================
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

let cameraStream = null;
let pose = null;
let poseStarted = false;
let isProcessing = false;
let isDemoMode = false;
let demoImage = null;
let currentProduct = null;

// Garment user adjustments & scale boundaries
const MIN_DRESS_SCALE = 0.75;
const MAX_DRESS_SCALE = 2.40;
let userScale = 1.0;
let userOffsetY = 0;
let userOpacity = 0.95; // Default 95% vibrant fabric realism (preserves PNG transparency)
let isFlippedV = false;
let isFlippedH = false;

// Smooth Body Tracking State (Interpolation & Anti-Flicker Hold)
let dressX = 0;
let dressY = 0;
let dressWidth = 0;
let dressHeight = 0;
let dressAngle = 0;
let isTracked = false;
let missedFrames = 0;
const MAX_HOLD_FRAMES = 12; // Keeps dress visible during brief movement or landmark drops

// Active Garment Image Object
const activeGarment = new Image();
activeGarment.crossOrigin = "anonymous";
let garmentLoaded = false;

activeGarment.onload = () => {
    garmentLoaded = true;
    console.log("Garment overlay loaded successfully:", activeGarment.src);
    if (isDemoMode && demoImage) {
        processStaticImage(demoImage);
    }
};

activeGarment.onerror = () => {
    garmentLoaded = false;
    console.warn("Garment image failed to load:", activeGarment.src);
};

// =====================================================
// STEP 1 & 2: LOAD EXACT PRODUCT FROM FIRESTORE OR CATALOG
// =====================================================
async function loadProduct() {
    let product = null;

    if (productId) {
        // 1. Attempt to load exact product document from Firestore
        try {
            const docRef = doc(db, "products", productId);
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                product = snapshot.data();
                product.id = snapshot.id;
            }
        } catch (err) {
            console.warn("Could not retrieve product from Firestore:", err);
        }

        // 2. If not found in Firestore, check if product was cached in sessionStorage during click
        if (!product) {
            try {
                const cached = sessionStorage.getItem("vesti_selected_product");
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && (parsed.id === productId || !parsed.id)) {
                        product = parsed;
                    }
                }
            } catch (e) {
                console.warn("Error reading sessionStorage:", e);
            }
        }

        // 3. If still not resolved, find exact product in curated fallback catalog
        if (!product && fallbackProducts && fallbackProducts.length > 0) {
            product = fallbackProducts.find(p =>
                p.id === productId ||
                p.alias === productId ||
                (p.name && p.name.toLowerCase() === productId.toLowerCase())
            );

            // Fuzzy match for id variations
            if (!product) {
                product = fallbackProducts.find(p =>
                    (productId && p.id && p.id.includes(productId)) ||
                    (productId && p.id && productId.includes(p.id))
                );
            }
        }
    }

    // If no product ID in URL and no product found yet, check sessionStorage
    if (!product) {
        try {
            const cached = sessionStorage.getItem("vesti_selected_product");
            if (cached) {
                product = JSON.parse(cached);
            }
        } catch (e) {}
    }

    // Default only if completely unselected (e.g. direct visit to tryon.html)
    if (!product) {
        product = fallbackProducts[0];
    }

    currentProduct = product;

    // Resolve the exact product image field from the product object
    // Inspects all common image field names (image, imageUrl, imageURL, productImage)
    const dressImage = product.image ||
                       product.imageUrl ||
                       product.imageURL ||
                       product.productImage ||
                       product.photoUrl ||
                       product.photoURL ||
                       "assets/product/reddress.png";

    // Required Debug Information
    console.log("Selected Product ID:", productId || product.id);
    console.log("Selected Product:", product);
    console.log("Selected Product Image:", dressImage);

    // Set active dress image to THIS EXACT DRESS
    activeGarment.src = dressImage;

    // Update Product Details UI
    updateProductUI(product, dressImage);

    // Setup Garment Tray with all available dresses
    setupGarmentTray(product);

    if (tryonStatus) {
        tryonStatus.textContent = `Ready to try on "${product.name || 'Selected Dress'}".`;
    }
}

function updateProductUI(product, dressImage) {
    if (tryonProductName) tryonProductName.textContent = product.name || "Virtual Garment";
    if (tryonProductCategory) tryonProductCategory.textContent = product.category || "Dresses";
    if (tryonProductPrice) tryonProductPrice.textContent = `₹${(Number(product.price) || 1999).toLocaleString()}`;
    if (tryonProductImage && dressImage) {
        tryonProductImage.src = dressImage;
        tryonProductImage.alt = product.name || "Dress Preview";
        tryonProductImage.style.display = "block";
    }
}

// =====================================================
// SETUP GARMENT SELECTION TRAY
// =====================================================
function setupGarmentTray(activeItem) {
    if (!garmentTray) return;
    garmentTray.innerHTML = "";

    // Build unified dress catalog
    const allItems = [...fallbackProducts];

    // Prepend active custom Firestore dress if not already present
    if (activeItem && activeItem.id && !allItems.some(p => p.id === activeItem.id)) {
        allItems.unshift(activeItem);
    }

    const activeId = activeItem ? (activeItem.id || activeItem.name) : (fallbackProducts[0]?.id || "");

    allItems.forEach((garment) => {
        const dressImg = garment.image || garment.imageUrl || garment.imageURL || garment.productImage || "assets/product/reddress.png";
        const isActive = garment.id === activeId || garment.name === activeItem?.name;

        const option = document.createElement("div");
        option.className = `garment-option ${isActive ? 'active' : ''}`;
        option.dataset.id = garment.id || "";
        option.innerHTML = `
            <img src="${dressImg}" alt="${garment.name || 'Dress'}" onerror="this.src='assets/product/reddress.png'">
            <span>${garment.name || 'Dress'}</span>
        `;

        option.addEventListener("click", () => {
            selectGarment(garment);
        });

        garmentTray.appendChild(option);
    });
}

function selectGarment(item) {
    currentProduct = item;
    const dressImage = item.image || item.imageUrl || item.imageURL || item.productImage || "assets/product/reddress.png";

    // Debug logs
    console.log("Selected Product ID:", item.id);
    console.log("Selected Product:", item);
    console.log("Selected Product Image:", dressImage);

    activeGarment.src = dressImage;
    updateProductUI(item, dressImage);

    // Update active highlight in tray
    document.querySelectorAll(".garment-option").forEach(el => {
        el.classList.toggle("active", el.dataset.id === item.id);
    });

    // Update URL query param smoothly
    if (item.id) {
        const newUrl = `${window.location.pathname}?id=${encodeURIComponent(item.id)}`;
        window.history.replaceState(null, "", newUrl);
    }

    if (tryonStatus) {
        tryonStatus.textContent = `Selected "${item.name}". Step in front of the camera!`;
    }

    if (window.showToast) {
        window.showToast(`Switched outfit to ${item.name} ✨`);
    }

    if (isDemoMode && demoImage) {
        processStaticImage(demoImage);
    }
}

// =====================================================
// MEDIAPIPE POSE INITIALIZATION
// =====================================================
function initializePose() {
    if (typeof Pose === "undefined") {
        console.error("MediaPipe Pose library is unavailable.");
        if (tryonStatus) tryonStatus.textContent = "AI Pose library failed to load.";
        return false;
    }

    pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults(handlePoseResults);
    console.log("MediaPipe Pose initialized successfully.");
    return true;
}

// =====================================================
// STEP 3, 4, 5, 6: BODY LANDMARK DETECTION & AUTOMATIC FITTING
// =====================================================
function handlePoseResults(results) {
    if (!canvasContext || !cameraCanvas) return;

    // Synchronize canvas resolution with source video/image
    let sourceWidth = cameraVideo.videoWidth;
    let sourceHeight = cameraVideo.videoHeight;

    if (isDemoMode && demoImage) {
        sourceWidth = demoImage.naturalWidth || demoImage.width;
        sourceHeight = demoImage.naturalHeight || demoImage.height;
    }

    if (!sourceWidth || !sourceHeight) return;

    if (cameraCanvas.width !== sourceWidth || cameraCanvas.height !== sourceHeight) {
        cameraCanvas.width = sourceWidth;
        cameraCanvas.height = sourceHeight;
    }

    // Clear previous drawing
    canvasContext.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);

    // If Demo Mode, draw base model image onto canvas background
    if (isDemoMode && demoImage) {
        canvasContext.drawImage(demoImage, 0, 0, cameraCanvas.width, cameraCanvas.height);
    }

    // Check if landmarks were detected (with Graceful Hold Buffer)
    if (!results.poseLandmarks) {
        if (missedFrames < MAX_HOLD_FRAMES && isTracked) {
            missedFrames++;
            renderClothingOverlay();
            return;
        }
        isTracked = false;
        missedFrames = 0;
        if (tryonStatus) tryonStatus.textContent = "Searching for body... Please step in front of the camera.";
        return;
    }

    const landmarks = results.poseLandmarks;

    // 1. Detect Essential Body Landmarks:
    // Landmark 0: Nose (for neck/collarline reference)
    // Landmark 11: Left Shoulder
    // Landmark 12: Right Shoulder
    // Landmark 23: Left Hip
    // Landmark 24: Right Hip
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Check shoulder presence and visibility with hold buffer fallback
    if (!leftShoulder || !rightShoulder || (leftShoulder.visibility ?? 1) < 0.18 || (rightShoulder.visibility ?? 1) < 0.18) {
        if (missedFrames < MAX_HOLD_FRAMES && isTracked) {
            missedFrames++;
            renderClothingOverlay();
            return;
        }
        isTracked = false;
        missedFrames = 0;
        if (tryonStatus) tryonStatus.textContent = "Please face the camera with upper body clearly visible.";
        return;
    }

    // Reset hold counter on good detection frame
    missedFrames = 0;

    const canvasW = cameraCanvas.width;
    const canvasH = cameraCanvas.height;

    // Convert normalized landmark positions to actual canvas pixels (Relative to video dimensions!)
    const lShoulder = { x: leftShoulder.x * canvasW, y: leftShoulder.y * canvasH };
    const rShoulder = { x: rightShoulder.x * canvasW, y: rightShoulder.y * canvasH };

    // 2. Exact Shoulder Width (Biacromial span)
    const shoulderWidth = Math.hypot(
        rShoulder.x - lShoulder.x,
        rShoulder.y - lShoulder.y
    );

    // Mid-shoulder reference point (Horizontal Center of upper torso)
    const midShoulder = {
        x: (lShoulder.x + rShoulder.x) / 2,
        y: (lShoulder.y + rShoulder.y) / 2
    };

    // 3. Exact Hip Width & Torso Height for Proportion Recognition
    let hipWidth;
    let midHip = null;
    const hipsDetected = leftHip && rightHip &&
        (leftHip.visibility === undefined || leftHip.visibility > 0.18) &&
        (rightHip.visibility === undefined || rightHip.visibility > 0.18);

    if (hipsDetected) {
        const lHip = { x: leftHip.x * canvasW, y: leftHip.y * canvasH };
        const rHip = { x: rightHip.x * canvasW, y: rightHip.y * canvasH };
        hipWidth = Math.hypot(
            rHip.x - lHip.x,
            rHip.y - lHip.y
        );
        midHip = {
            x: (lHip.x + rHip.x) / 2,
            y: (lHip.y + rHip.y) / 2
        };
    } else {
        // Natural anatomical estimation when hips are below camera frame
        hipWidth = shoulderWidth * 1.05;
        midHip = {
            x: midShoulder.x,
            y: midShoulder.y + (shoulderWidth * 1.40)
        };
    }

    // 4. SIGNIFICANTLY LARGER DRESS SIZING (1.9x to 2.45x Multiplier for Full Body Coverage):
    // Covers shoulders, chest, waist, and extends over upper legs appropriately
    const hipToShoulderRatio = hipWidth / Math.max(1, shoulderWidth);
    let shapeMultiplier = 2.15; // Generous 2.15x base multiplier
    let detectedShapeName = "Standard Fit";

    if (hipToShoulderRatio > 1.05) {
        // Curvy / Hourglass shape: hips broader than shoulders
        shapeMultiplier = Math.min(2.45, Math.max(2.20, hipToShoulderRatio * 2.0));
        detectedShapeName = "Curvy / Hourglass Silhouette";
    } else if (hipToShoulderRatio < 0.88) {
        // Athletic / Broad shoulders
        shapeMultiplier = 2.10;
        detectedShapeName = "Athletic / Broad Frame";
    } else if (shoulderWidth / canvasW < 0.22) {
        // Petite / Slim frame or standing farther back
        shapeMultiplier = 2.22;
        detectedShapeName = "Petite / Slim Frame";
    } else if (shoulderWidth / canvasW > 0.35) {
        // Relaxed / Plus frame or closer to camera
        shapeMultiplier = 2.30;
        detectedShapeName = "Relaxed / Plus Fit";
    } else {
        shapeMultiplier = 2.15;
        detectedShapeName = "Regular Fit";
    }

    // Dynamic dress width: ensures full coverage of shoulders, chest, waist, and hips
    const dynamicBaseWidth = Math.max(
        shoulderWidth * shapeMultiplier,
        hipWidth * 1.60
    );

    // Apply clamped user scale factor (MIN_DRESS_SCALE to MAX_DRESS_SCALE)
    const effectiveScale = Math.min(MAX_DRESS_SCALE, Math.max(MIN_DRESS_SCALE, userScale));
    let targetWidth = dynamicBaseWidth * effectiveScale;

    // Safety boundaries: Prevent dress from collapsing to tiny or overflowing screen
    const MIN_DRESS_WIDTH = Math.max(160, canvasW * 0.22);
    const MAX_DRESS_WIDTH = canvasW * 0.96;
    targetWidth = Math.min(MAX_DRESS_WIDTH, Math.max(MIN_DRESS_WIDTH, targetWidth));

    // Dynamic dress height: Preserves garment's natural aspect ratio without distortion
    const imgW = activeGarment.naturalWidth || 400;
    const imgH = activeGarment.naturalHeight || 600;
    const garmentAspect = imgH / imgW;
    const targetHeight = targetWidth * garmentAspect;

    // 5. PRECISE TORSO ALIGNMENT (Neckline / Clavicle Anchoring):
    // Places top of the dress around the neck/clavicle so it drapes down over torso and legs
    let topY = midShoulder.y - (shoulderWidth * 0.24) + userOffsetY;
    if (nose && (nose.visibility === undefined || nose.visibility > 0.25)) {
        const noseY = nose.y * canvasH;
        const neckAnchor = noseY + (midShoulder.y - noseY) * 0.70;
        topY = (neckAnchor - (shoulderWidth * 0.16)) + userOffsetY;
    }

    // Center coordinates for drawing
    const targetX = midShoulder.x;
    const targetY = topY + (targetHeight / 2);

    // 6. STRAIGHT UPRIGHT HANG (Zero Tilt):
    // Dress hangs straight under natural gravity without crooked angles
    const targetAngle = 0;

    // 7. SMOOTH BODY TRACKING & JITTER ELIMINATION:
    if (!isTracked) {
        dressX = targetX;
        dressY = targetY;
        dressWidth = targetWidth;
        dressHeight = targetHeight;
        dressAngle = 0;
        isTracked = true;
    } else {
        const smoothing = 0.24; // Responsive smoothing factor for natural motion
        dressX += (targetX - dressX) * smoothing;
        dressY += (targetY - dressY) * smoothing;
        dressWidth += (targetWidth - dressWidth) * smoothing;
        dressHeight += (targetHeight - dressHeight) * smoothing;
        dressAngle = 0;
    }

    // 8. Render dress overlay
    renderClothingOverlay();

    // Body Fit Status Feedback showing recognized body shape and scaled dimensions
    if (tryonStatus) {
        tryonStatus.textContent = `✨ AI Body-Fit: ${detectedShapeName} • Straight Hang • Scaled (${Math.round(dressWidth)}px width × ${Math.round(dressHeight)}px height)`;
    }
}

// =====================================================
// RENDER CLOTHING OVERLAY WITH TRANSPARENCY
// =====================================================
function renderClothingOverlay() {
    if (!garmentLoaded || !activeGarment.naturalWidth || !activeGarment.naturalHeight) return;

    canvasContext.save();

    // 1. High-quality smooth scaling
    canvasContext.imageSmoothingEnabled = true;
    canvasContext.imageSmoothingQuality = "high";

    // 2. Position dress around torso center
    canvasContext.translate(dressX, dressY);

    // 3. Rotate (0 deg straight upright hang)
    canvasContext.rotate(dressAngle);

    // 4. Apply orientation scales
    const scaleX = isFlippedH ? -1 : 1;
    const scaleY = isFlippedV ? -1 : 1;
    canvasContext.scale(scaleX, scaleY);

    // 5. Subtle realistic fabric shadow
    canvasContext.shadowColor = "rgba(0, 0, 0, 0.25)";
    canvasContext.shadowBlur = Math.min(22, dressWidth * 0.04);
    canvasContext.shadowOffsetY = Math.min(14, dressHeight * 0.02);

    // 6. DRESS TRANSPARENCY / OPACITY (Default 95% for vibrant realism, preserves PNG transparency):
    canvasContext.globalAlpha = userOpacity;

    // 7. Draw dynamic dress overlay (natively supports transparent PNG backgrounds)
    canvasContext.drawImage(
        activeGarment,
        -dressWidth / 2,
        -dressHeight / 2,
        dressWidth,
        dressHeight
    );

    canvasContext.restore();
}

let userRequestedCamera = false;

// =====================================================
// CAMERA CONTROLS (getUserMedia Preserved & Resilient)
// =====================================================
async function startCamera() {
    userRequestedCamera = true;
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (window.location.protocol === "file:") {
                alert("Browser Security Notice: Live webcam access is restricted on local 'file://' URLs by modern browsers. Please run this project via a local web server (e.g. VS Code Live Server or http://localhost), or click 'Try Demo Model' to test all AI fitting features instantly!");
            } else {
                alert("Webcam is not supported or accessible on this browser.");
            }
            if (tryonStatus) tryonStatus.textContent = "Webcam unavailable on file://. Try Demo Model!";
            return;
        }

        if (tryonStatus) tryonStatus.textContent = "Requesting camera access...";
        isDemoMode = false;

        // Try ideal 720p constraints first, fall back to basic video if unsupported
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
        } catch (constraintErr) {
            console.warn("Ideal camera constraints failed, attempting basic video constraint:", constraintErr);
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
        }

        cameraVideo.srcObject = cameraStream;
        cameraVideo.muted = true;
        cameraVideo.playsInline = true;
        cameraVideo.style.display = "block";
        if (cameraPlaceholder) cameraPlaceholder.style.display = "none";

        try {
            await cameraVideo.play();
        } catch (playErr) {
            console.warn("Direct play rejected, waiting for loadedmetadata:", playErr);
            await new Promise((resolve) => {
                cameraVideo.onloadedmetadata = () => {
                    cameraVideo.play().then(resolve).catch(resolve);
                };
                setTimeout(resolve, 800);
            });
        }

        startCameraButton.disabled = true;
        stopCameraButton.disabled = false;
        if (cameraStatus) cameraStatus.textContent = "Live Camera Active";

        if (!poseStarted) {
            if (typeof Pose === "undefined") {
                if (tryonStatus) tryonStatus.textContent = "Loading AI pose tracker...";
                for (let i = 0; i < 25 && typeof Pose === "undefined"; i++) {
                    await new Promise(r => setTimeout(r, 200));
                }
            }
            const ok = initializePose();
            if (!ok) {
                console.warn("Pose initialization delayed or failed.");
            } else {
                poseStarted = true;
            }
        }

        isTracked = false;
        processVideoFrames();
        if (window.showToast) window.showToast("Camera activated! Stand in view 🤳");
    } catch (err) {
        console.error("Camera startup error:", err);
        userRequestedCamera = false;
        if (tryonStatus) tryonStatus.textContent = "Camera access denied or unavailable. Try 'Demo Model' mode!";
        if (window.showToast) window.showToast("Camera blocked or unavailable. Try Demo Mode!", "error");
    }
}

async function processVideoFrames() {
    if (!cameraStream || isDemoMode) return;

    if (!isProcessing && cameraVideo.readyState >= 2 && cameraVideo.videoWidth && cameraVideo.videoHeight) {
        isProcessing = true;
        try {
            await pose.send({ image: cameraVideo });
        } catch (e) {
            console.error("Frame processing error:", e);
        }
        isProcessing = false;
    }

    if (cameraStream) {
        requestAnimationFrame(processVideoFrames);
    }
}

function stopCamera() {
    userRequestedCamera = false;
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    cameraVideo.srcObject = null;
    cameraVideo.style.display = "none";
    if (cameraPlaceholder) cameraPlaceholder.style.display = "flex";

    if (canvasContext && cameraCanvas) {
        canvasContext.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
    }

    startCameraButton.disabled = false;
    stopCameraButton.disabled = true;
    if (cameraStatus) cameraStatus.textContent = "Camera Inactive";
    if (tryonStatus) tryonStatus.textContent = "Camera stopped. Select Demo Model or start camera.";
    isTracked = false;
}

// =====================================================
// DEMO MODEL MODE (Works without webcam)
// =====================================================
function startDemoMode() {
    stopCamera();
    isDemoMode = true;

    if (cameraPlaceholder) cameraPlaceholder.style.display = "none";
    if (cameraStatus) cameraStatus.textContent = "Demo Studio Model Active";
    if (tryonStatus) tryonStatus.textContent = "Loading fashion model preview...";

    demoImage = new Image();
    demoImage.crossOrigin = "anonymous";
    demoImage.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80";

    demoImage.onload = async () => {
        if (!poseStarted) {
            initializePose();
            poseStarted = true;
        }

        cameraCanvas.width = demoImage.naturalWidth;
        cameraCanvas.height = demoImage.naturalHeight;

        isTracked = false;
        await processStaticImage(demoImage);
        if (window.showToast) window.showToast("Demo Model loaded! Try adjusting fit sliders ✨");
    };

    demoImage.onerror = () => {
        if (tryonStatus) tryonStatus.textContent = "Failed to load demo model image.";
    };
}

async function processStaticImage(imgElement) {
    if (!pose) return;
    try {
        await pose.send({ image: imgElement });
    } catch (err) {
        console.error("Error processing static model:", err);
    }
}

// =====================================================
// PHOTO UPLOAD (Try on your own photo)
// =====================================================
if (photoUploadInput) {
    photoUploadInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        stopCamera();
        isDemoMode = true;

        const reader = new FileReader();
        reader.onload = (event) => {
            demoImage = new Image();
            demoImage.onload = async () => {
                if (!poseStarted) {
                    initializePose();
                    poseStarted = true;
                }
                cameraCanvas.width = demoImage.naturalWidth;
                cameraCanvas.height = demoImage.naturalHeight;
                isTracked = false;
                await processStaticImage(demoImage);
                if (window.showToast) window.showToast("Your photo is loaded for Virtual Try-On! 👗");
            };
            demoImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// =====================================================
// SNAP / DOWNLOAD PHOTO
// =====================================================
if (snapPhotoButton) {
    snapPhotoButton.addEventListener("click", () => {
        if (!cameraCanvas || cameraCanvas.width === 0) {
            alert("No try-on image active to capture.");
            return;
        }

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = cameraCanvas.width;
        tempCanvas.height = cameraCanvas.height;
        const tempCtx = tempCanvas.getContext("2d");

        // 1. Draw video background or demo image
        if (cameraVideo.style.display !== "none" && cameraVideo.videoWidth) {
            tempCtx.save();
            tempCtx.translate(tempCanvas.width, 0);
            tempCtx.scale(-1, 1);
            tempCtx.drawImage(cameraVideo, 0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.restore();
        } else if (demoImage) {
            tempCtx.drawImage(demoImage, 0, 0, tempCanvas.width, tempCanvas.height);
        }

        // 2. Draw clothing overlay on top
        tempCtx.save();
        tempCtx.translate(tempCanvas.width, 0);
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(cameraCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.restore();

        // 3. Watermark
        tempCtx.font = "bold 22px Outfit, sans-serif";
        tempCtx.fillStyle = "rgba(255, 255, 255, 0.95)";
        tempCtx.shadowColor = "rgba(0, 0, 0, 0.6)";
        tempCtx.shadowBlur = 6;
        tempCtx.fillText("VestiAI Virtual Try-On", 28, tempCanvas.height - 28);

        const dataURL = tempCanvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = `VestiAI-TryOn-${Date.now()}.png`;
        a.click();

        if (window.showToast) window.showToast("Try-On photo downloaded! 📸");
    });
}

// =====================================================
// SLIDER CONTROLS (Scale, Offset, Opacity)
// =====================================================
if (scaleSlider) {
    scaleSlider.addEventListener("input", (e) => {
        userScale = parseFloat(e.target.value);
        if (scaleVal) scaleVal.textContent = `${userScale.toFixed(2)}x`;
        if (isDemoMode && demoImage) processStaticImage(demoImage);
    });
}

if (offsetSlider) {
    offsetSlider.addEventListener("input", (e) => {
        userOffsetY = parseInt(e.target.value, 10);
        if (offsetVal) offsetVal.textContent = `${userOffsetY > 0 ? '+' : ''}${userOffsetY}px`;
        if (isDemoMode && demoImage) processStaticImage(demoImage);
    });
}

if (opacitySlider) {
    opacitySlider.addEventListener("input", (e) => {
        userOpacity = parseFloat(e.target.value);
        if (opacityVal) opacityVal.textContent = `${Math.round(userOpacity * 100)}%`;
        if (isDemoMode && demoImage) processStaticImage(demoImage);
    });
}

// Invert / Flip Button
const flipVerticalBtn = document.getElementById("flipVerticalBtn");
if (flipVerticalBtn) {
    flipVerticalBtn.addEventListener("click", () => {
        isFlippedV = !isFlippedV;
        if (window.showToast) {
            window.showToast(isFlippedV ? "Garment inverted (vertical flip)" : "Garment orientation upright ✨");
        }
        if (isDemoMode && demoImage) processStaticImage(demoImage);
    });
}

// Reset Fit Button
const resetFitBtn = document.getElementById("resetFitBtn");
if (resetFitBtn) {
    resetFitBtn.addEventListener("click", () => {
        userScale = 1.0;
        userOffsetY = 0;
        userOpacity = 0.95;
        isFlippedV = false;
        isFlippedH = false;
        if (scaleSlider) scaleSlider.value = "1.0";
        if (scaleVal) scaleVal.textContent = "1.0x";
        if (offsetSlider) offsetSlider.value = "0";
        if (offsetVal) offsetVal.textContent = "0px";
        if (opacitySlider) opacitySlider.value = "0.95";
        if (opacityVal) opacityVal.textContent = "95%";
        if (window.showToast) window.showToast("Fit settings reset to default! ✨");
        if (isDemoMode && demoImage) processStaticImage(demoImage);
    });
}

// =====================================================
// ADD TO CART DIRECTLY FROM TRY-ON (Firestore Preserved)
// =====================================================
if (addToCartTryonBtn) {
    addToCartTryonBtn.addEventListener("click", async () => {
        const item = currentProduct || fallbackProducts[0];
        const user = auth.currentUser;

        if (!user) {
            if (window.showToast) window.showToast("Please login to save to cart!", "error");
            setTimeout(() => {
                const target = item.id ? `tryon.html?id=${encodeURIComponent(item.id)}` : "tryon.html";
                window.location.href = `login.html?redirect=${encodeURIComponent(target)}`;
            }, 1200);
            return;
        }

        try {
            addToCartTryonBtn.disabled = true;
            addToCartTryonBtn.textContent = "Adding...";

            const cartRef = doc(db, "carts", user.uid, "items", item.id || "tryon-item");
            const existing = await getDoc(cartRef);
            let qty = 1;
            if (existing.exists()) {
                qty = (Number(existing.data().quantity) || 1) + 1;
            }

            await setDoc(cartRef, {
                productId: item.id || "tryon-item",
                name: item.name,
                category: item.category || "Dresses",
                price: Number(item.price) || 1999,
                image: item.image || activeGarment.src || "",
                quantity: qty
            });

            addToCartTryonBtn.textContent = "Added to Cart ✓";
            if (window.showToast) window.showToast(`${item.name} added to cart! 🛍️`);

            setTimeout(() => {
                addToCartTryonBtn.disabled = false;
                addToCartTryonBtn.textContent = "🛍️ Add to Cart";
            }, 2500);
        } catch (err) {
            console.error("Error adding to cart:", err);
            addToCartTryonBtn.disabled = false;
            addToCartTryonBtn.textContent = "🛍️ Add to Cart";
            if (window.showToast) window.showToast("Failed to add to cart.", "error");
        }
    });
}

// =====================================================
// BUY NOW DIRECTLY FROM TRY-ON
// =====================================================
if (buyNowTryonBtn) {
    buyNowTryonBtn.addEventListener("click", async () => {
        const item = currentProduct || fallbackProducts[0];
        const user = auth.currentUser;

        sessionStorage.setItem("vesti_pending_buy_now", JSON.stringify({
            productId: item.id || "tryon-item",
            name: item.name,
            category: item.category || "Dresses",
            price: Number(item.price) || 1999,
            image: item.image || activeGarment.src || "",
            quantity: 1
        }));

        if (!user) {
            if (window.showToast) window.showToast("Proceeding to checkout...", "info");
            setTimeout(() => {
                window.location.href = "login.html?redirect=checkout.html";
            }, 600);
            return;
        }

        try {
            buyNowTryonBtn.disabled = true;
            buyNowTryonBtn.textContent = "Directing to Checkout...";

            const cartRef = doc(db, "carts", user.uid, "items", item.id || "tryon-item");
            const existing = await getDoc(cartRef);
            let qty = 1;
            if (existing.exists()) {
                qty = (Number(existing.data().quantity) || 1) + 1;
            }

            await setDoc(cartRef, {
                productId: item.id || "tryon-item",
                name: item.name,
                category: item.category || "Dresses",
                price: Number(item.price) || 1999,
                image: item.image || activeGarment.src || "",
                quantity: qty
            });

            window.location.href = "checkout.html";
        } catch (err) {
            console.error("Error setting Buy Now item in cart:", err);
            window.location.href = "checkout.html";
        }
    });
}

// =====================================================
// EVENT LISTENERS & INITIALIZATION
// =====================================================
if (startCameraButton) startCameraButton.addEventListener("click", startCamera);
if (stopCameraButton) stopCameraButton.addEventListener("click", stopCamera);
if (demoModelButton) demoModelButton.addEventListener("click", startDemoMode);

// Initialize Page & Load Selected Product
loadProduct();

// Auto-start Demo Mode after 1.5s only if camera is inactive and not requested
setTimeout(() => {
    if (!cameraStream && !isDemoMode && !userRequestedCamera) {
        console.log("Auto-initializing studio demo mode.");
        startDemoMode();
    }
}, 1500);
// ==========================================================================
// VESTI-AI - QR CODE SCANNING & BOUTIQUE HANGTAG PARSER
// Scans QR tags, validates garment identifiers against the database,
// and routes users directly to the matching dress product or try-on stage.
// ==========================================================================

import { fallbackProducts, isDressProduct } from "./products.js";

export function initQrScanner() {
    const videoElem = document.getElementById("qrVideo");
    const startScanBtn = document.getElementById("startScanBtn");
    const stopScanBtn = document.getElementById("stopScanBtn");
    const qrStatus = document.getElementById("qrStatus");
    const manualInput = document.getElementById("manualCode");
    const lookupBtn = document.getElementById("lookupCodeBtn");
    const validationResult = document.getElementById("validationResult");

    let stream = null;
    let isScanning = false;

    // Validate a Product ID or URL
    function validateAndRoute(code) {
        if (!code) return;
        const cleaned = code.trim().toLowerCase();

        // Check if input is a full URL or product ID
        let targetId = cleaned;
        if (cleaned.includes("id=")) {
            const params = new URLSearchParams(cleaned.split("?")[1]);
            targetId = params.get("id") || cleaned;
        }

        // Validate against verified dresses
        const found = fallbackProducts.find(p => p.id.toLowerCase() === targetId || p.name.toLowerCase().includes(targetId));

        if (found) {
            if (validationResult) {
                validationResult.style.display = "block";
                validationResult.className = "status-badge tested";
                validationResult.innerHTML = `✅ Found "${found.name}" (ID: ${found.id}). Redirecting to Virtual Studio...`;
            }
            if (window.showToast) window.showToast(`Found ${found.name}! Redirecting... ✨`);
            setTimeout(() => {
                window.location.href = `tryon.html?id=${encodeURIComponent(found.id)}`;
            }, 900);
        } else {
            if (validationResult) {
                validationResult.style.display = "block";
                validationResult.className = "status-badge partial";
                validationResult.innerHTML = `⚠️ Product ID "${targetId}" not found in current boutique catalog. Opening default studio.`;
            }
            if (window.showToast) window.showToast(`Item not found in catalog`, "error");
            setTimeout(() => {
                window.location.href = `tryon.html`;
            }, 1400);
        }
    }

    if (lookupBtn && manualInput) {
        lookupBtn.addEventListener("click", () => {
            validateAndRoute(manualInput.value);
        });

        manualInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                validateAndRoute(manualInput.value);
            }
        });
    }

    // Camera Scan simulation & BarcodeDetector integration if available
    if (startScanBtn && videoElem) {
        startScanBtn.addEventListener("click", async () => {
            try {
                if (qrStatus) qrStatus.textContent = "Requesting camera for QR scanning...";
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                    audio: false
                });
                videoElem.srcObject = stream;
                videoElem.style.display = "block";
                await videoElem.play();
                isScanning = true;
                startScanBtn.disabled = true;
                if (stopScanBtn) stopScanBtn.disabled = false;
                if (qrStatus) qrStatus.textContent = "Point your camera at a boutique dress hangtag QR code.";

                // Native BarcodeDetector API check
                if ('BarcodeDetector' in window) {
                    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                    const detectLoop = async () => {
                        if (!isScanning) return;
                        try {
                            const barcodes = await detector.detect(videoElem);
                            if (barcodes.length > 0) {
                                const detectedValue = barcodes[0].rawValue;
                                stopScan();
                                validateAndRoute(detectedValue);
                                return;
                            }
                        } catch (err) {
                            console.warn("QR frame detection error:", err);
                        }
                        if (isScanning) requestAnimationFrame(detectLoop);
                    };
                    detectLoop();
                }
            } catch (err) {
                console.error("Camera scanner error:", err);
                if (qrStatus) qrStatus.textContent = "Camera access denied. Please use manual code lookup or click a demo QR tag.";
            }
        });
    }

    function stopScan() {
        isScanning = false;
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }
        if (videoElem) {
            videoElem.srcObject = null;
            videoElem.style.display = "none";
        }
        if (startScanBtn) startScanBtn.disabled = false;
        if (stopScanBtn) stopScanBtn.disabled = true;
        if (qrStatus) qrStatus.textContent = "Camera scanner stopped.";
    }

    if (stopScanBtn) {
        stopScanBtn.addEventListener("click", stopScan);
    }

    // Quick demo barcode click handlers
    document.querySelectorAll(".demo-qr-pill").forEach(pill => {
        pill.addEventListener("click", () => {
            const id = pill.dataset.id;
            if (id) {
                if (manualInput) manualInput.value = id;
                validateAndRoute(id);
            }
        });
    });
}

// Auto init
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initQrScanner);
} else {
    initQrScanner();
}

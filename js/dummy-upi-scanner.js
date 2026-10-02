/**
 * ==========================================================================
 * DUMMY UPI QR SCANNER & PAYMENT SIMULATOR CONTROLLER
 * Fully Interactive Educational & Demo Module
 * ==========================================================================
 */

(function () {
    let currentAmount = 1999;
    let successCallback = null;
    let cancelCallback = null;
    let enteredPin = "";
    let mediaStream = null;
    let selectedOutcome = "success"; // 'success', 'failed', 'pending'

    // Simple Web Audio Sound Synthesizer for UPI Beep & Success Chime
    function playAudioTone(type) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === "scan") {
                // Short crisp beep
                osc.type = "sine";
                osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                osc.start();
                osc.stop(ctx.currentTime + 0.15);
            } else if (type === "success") {
                // Two-tone pleasant victory chime
                osc.type = "triangle";
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
                osc.start();
                osc.stop(ctx.currentTime + 0.6);
            } else if (type === "error") {
                // Low buzz
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            }
        } catch (e) {
            // Audio context silently ignored if autoplay policy restricts
        }
    }

    // Stop active camera
    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        const video = document.getElementById("dummyCameraVideo");
        if (video) {
            video.srcObject = null;
            video.style.display = "none";
        }
        const placeholder = document.getElementById("dummyScannerGraphic");
        if (placeholder) placeholder.style.display = "flex";
    }

    // Start Webcam Feed
    async function startCamera() {
        const video = document.getElementById("dummyCameraVideo");
        const placeholder = document.getElementById("dummyScannerGraphic");
        const statusChip = document.getElementById("dummyCamStatusText");

        try {
            if (statusChip) statusChip.textContent = "Requesting camera...";
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            if (video) {
                video.srcObject = mediaStream;
                video.style.display = "block";
                if (placeholder) placeholder.style.display = "none";
            }
            if (statusChip) statusChip.textContent = "Camera active • Scan QR";
        } catch (err) {
            console.warn("Camera access unavailable or denied. Running simulation mode.", err);
            if (statusChip) statusChip.textContent = "Simulated Camera Mode";
            if (video) video.style.display = "none";
            if (placeholder) placeholder.style.display = "flex";
        }
    }

    // Switch between UI steps in Modal
    function showStep(stepName) {
        const steps = ["stepScanner", "stepDetected", "stepPin", "stepProcessing", "stepOutcome"];
        steps.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.style.display = (s === stepName) ? "block" : "none";
        });
    }

    // Keypad Logic
    function updatePinDots() {
        for (let i = 1; i <= 4; i++) {
            const dot = document.getElementById(`pinDot${i}`);
            if (dot) {
                if (i <= enteredPin.length) {
                    dot.textContent = "●";
                    dot.classList.add("filled");
                    dot.classList.remove("active");
                } else if (i === enteredPin.length + 1) {
                    dot.textContent = "";
                    dot.classList.remove("filled");
                    dot.classList.add("active");
                } else {
                    dot.textContent = "";
                    dot.classList.remove("filled");
                    dot.classList.remove("active");
                }
            }
        }
    }

    function handleKeypadPress(val) {
        if (val === "back") {
            enteredPin = enteredPin.slice(0, -1);
            updatePinDots();
        } else if (val === "submit") {
            validateAndProcessPin();
        } else if (enteredPin.length < 4) {
            enteredPin += val;
            updatePinDots();
            if (enteredPin.length === 4) {
                setTimeout(validateAndProcessPin, 250);
            }
        }
    }

    function validateAndProcessPin() {
        // Accepts 1234 or any 4 digit demo PIN for easy learning
        if (enteredPin.length < 4) {
            const err = document.getElementById("pinErrorMessage");
            if (err) err.textContent = "Please enter 4 digits (Demo PIN: 1234)";
            playAudioTone("error");
            return;
        }

        // Show Processing
        showStep("stepProcessing");

        setTimeout(() => {
            renderOutcome();
        }, 1500);
    }

    function renderOutcome() {
        const scenario = document.getElementById("demoResultSelector")?.value || selectedOutcome || "success";
        const outcomeContainer = document.getElementById("stepOutcome");
        if (!outcomeContainer) return;

        const txnId = "DEMO-TXN-" + Math.floor(100000 + Math.random() * 900000);
        const formattedDate = new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });

        if (scenario === "success") {
            playAudioTone("success");
            outcomeContainer.innerHTML = `
                <div class="outcome-card success">
                    <div class="outcome-icon-large">✓</div>
                    <h3 class="outcome-title">Payment Successful</h3>
                    <p style="color: #64748b; font-size: 0.85rem;">Paid to VestiAI Luxury Store</p>
                    <div class="outcome-amount-tag">₹${Number(currentAmount).toLocaleString()}</div>

                    <div class="outcome-meta-list">
                        <div class="outcome-meta-row">
                            <span>Receiver UPI:</span>
                            <strong>vestiai@demo</strong>
                        </div>
                        <div class="outcome-meta-row">
                            <span>Transaction ID:</span>
                            <strong>${txnId}</strong>
                        </div>
                        <div class="outcome-meta-row">
                            <span>Date & Time:</span>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="outcome-meta-row">
                            <span>Status:</span>
                            <span style="color: #16a34a; font-weight: 700;">Completed (Demo)</span>
                        </div>
                    </div>

                    <div class="dummy-big-warning" style="margin-bottom: 14px;">
                        🔵 DEMO TRANSACTION – NO REAL MONEY DEDUCTED
                    </div>

                    <button type="button" class="btn-finish-outcome success-btn" id="btnFinishSuccess">
                        ✓ Complete Order Placement
                    </button>
                </div>
            `;

            document.getElementById("btnFinishSuccess")?.addEventListener("click", () => {
                window.DummyUpiScanner.close();
                if (successCallback) {
                    successCallback({
                        txnId: txnId,
                        amount: currentAmount,
                        status: "Paid via UPI Demo"
                    });
                }
            });

        } else if (scenario === "failed") {
            playAudioTone("error");
            outcomeContainer.innerHTML = `
                <div class="outcome-card failed">
                    <div class="outcome-icon-large">✕</div>
                    <h3 class="outcome-title">Payment Failed</h3>
                    <p style="color: #64748b; font-size: 0.85rem;">Demo transaction could not be processed</p>
                    <div class="outcome-amount-tag">₹${Number(currentAmount).toLocaleString()}</div>

                    <div class="outcome-explain-box">
                        <strong>Educational Note:</strong> In a real UPI payment, failures occur due to incorrect UPI PIN, weak mobile internet, bank server maintenance, or daily UPI limit exceeded.
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button type="button" class="btn-finish-outcome retry-btn" id="btnRetryFailed">
                            🔄 Try Again
                        </button>
                        <button type="button" class="btn-finish-outcome" id="btnCancelFailed" style="background: #e2e8f0; color: #334155;">
                            Close
                        </button>
                    </div>
                </div>
            `;

            document.getElementById("btnRetryFailed")?.addEventListener("click", () => {
                enteredPin = "";
                updatePinDots();
                showStep("stepScanner");
            });

            document.getElementById("btnCancelFailed")?.addEventListener("click", () => {
                window.DummyUpiScanner.close();
            });

        } else {
            // Pending
            outcomeContainer.innerHTML = `
                <div class="outcome-card pending">
                    <div class="outcome-icon-large">⏳</div>
                    <h3 class="outcome-title">Payment Pending</h3>
                    <p style="color: #64748b; font-size: 0.85rem;">Awaiting confirmation from bank server</p>
                    <div class="outcome-amount-tag">₹${Number(currentAmount).toLocaleString()}</div>

                    <div class="outcome-explain-box">
                        <strong>Educational Note:</strong> A pending payment means money has left the sender's bank but receiver confirmation is delayed. Never pay twice immediately; wait for final SMS.
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button type="button" class="btn-finish-outcome pending-btn" id="btnCheckStatusPending">
                            🔄 Check Status Now
                        </button>
                        <button type="button" class="btn-finish-outcome" id="btnClosePending" style="background: #e2e8f0; color: #334155;">
                            Back to Checkout
                        </button>
                    </div>
                </div>
            `;

            document.getElementById("btnCheckStatusPending")?.addEventListener("click", () => {
                // Convert pending to success on check
                selectedOutcome = "success";
                renderOutcome();
            });

            document.getElementById("btnClosePending")?.addEventListener("click", () => {
                window.DummyUpiScanner.close();
            });
        }

        showStep("stepOutcome");
    }

    // Public API object
    window.DummyUpiScanner = {
        open: function (amount, onPaid, onCancel) {
            currentAmount = amount || 1999;
            successCallback = onPaid || null;
            cancelCallback = onCancel || null;
            enteredPin = "";

            const modal = document.getElementById("dummyUpiModal");
            if (!modal) return;

            // Sync amounts in modal
            const amtDisplays = modal.querySelectorAll(".dynamic-demo-amount");
            amtDisplays.forEach(el => el.textContent = `₹${Number(currentAmount).toLocaleString()}`);

            // Reset keypad dots
            updatePinDots();
            const err = document.getElementById("pinErrorMessage");
            if (err) err.textContent = "";

            // Show modal
            modal.style.display = "flex";
            showStep("stepScanner");

            // Auto-trigger simulation after short delay or wait for user click
            const statusChip = document.getElementById("dummyCamStatusText");
            if (statusChip) statusChip.textContent = "Scanning active • Tap Quick Scan";
        },

        close: function () {
            stopCamera();
            const modal = document.getElementById("dummyUpiModal");
            if (modal) modal.style.display = "none";
            if (cancelCallback) cancelCallback();
        },

        triggerScanSuccess: function () {
            playAudioTone("scan");
            stopCamera();
            showStep("stepDetected");
        }
    };

    // Initialize Event Listeners once DOM loads
    document.addEventListener("DOMContentLoaded", () => {
        const modal = document.getElementById("dummyUpiModal");
        if (!modal) return;

        // Close Buttons
        document.getElementById("btnDummyModalClose")?.addEventListener("click", () => {
            window.DummyUpiScanner.close();
        });

        // Simulate QR Scan Button
        document.getElementById("btnDummySimulateScan")?.addEventListener("click", () => {
            window.DummyUpiScanner.triggerScanSuccess();
        });

        // Camera Start Mode
        document.getElementById("btnDummyStartCam")?.addEventListener("click", () => {
            startCamera();
        });

        // Upload QR Mode
        document.getElementById("btnDummyUploadQR")?.addEventListener("click", () => {
            const input = document.getElementById("dummyQrFileInput");
            if (input) input.click();
        });

        document.getElementById("dummyQrFileInput")?.addEventListener("change", () => {
            window.DummyUpiScanner.triggerScanSuccess();
        });

        // Enter UPI ID Mode
        document.getElementById("btnDummyEnterUpi")?.addEventListener("click", () => {
            const entered = prompt("Enter Demo UPI ID:", "sharmaauto@demo");
            if (entered) {
                const el = document.getElementById("detectedUpiHandle");
                if (el) el.textContent = entered;
                window.DummyUpiScanner.triggerScanSuccess();
            }
        });

        // Continue to Pay Button from Step 2
        document.getElementById("btnDetectedProceedToPay")?.addEventListener("click", () => {
            enteredPin = "";
            updatePinDots();
            showStep("stepPin");
        });

        // Cancel from Step 2
        document.getElementById("btnDetectedCancel")?.addEventListener("click", () => {
            showStep("stepScanner");
        });

        // Numeric Keypad Clicks
        modal.querySelectorAll(".keypad-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const val = btn.getAttribute("data-val");
                if (val) handleKeypadPress(val);
            });
        });

        // Dropdown scenario selector change
        const selector = document.getElementById("demoResultSelector");
        if (selector) {
            selector.addEventListener("change", (e) => {
                selectedOutcome = e.target.value;
            });
        }
    });

})();

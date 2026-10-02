// ==========================================================================
// VestiAI - Global Application JavaScript & Utilities
// ==========================================================================

// Global Toast System
window.showToast = function (message, type = "success") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon = type === "success" ? "✨" : type === "error" ? "⚠️" : "ℹ️";
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("removing");
        setTimeout(() => toast.remove(), 350);
    }, 3200);
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("VestiAI luxury studio initialized.");

    // Mobile Navigation Toggle
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.querySelector(".nav-menu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("mobile-active");
        });

        // Close on link click
        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("mobile-active");
            });
        });
    }

    // Promotional Banner Countdown Timer
    const hoursEl = document.getElementById("timerHours");
    const minsEl = document.getElementById("timerMins");
    const secsEl = document.getElementById("timerSecs");

    if (hoursEl && minsEl && secsEl) {
        let remainingSeconds = 14 * 3600 + 48 * 60 + 22; // 14h 48m 22s initial offer window
        
        function updateTimer() {
            if (remainingSeconds <= 0) {
                remainingSeconds = 24 * 3600; // auto-refresh 24h cycle
            }
            remainingSeconds--;

            const h = Math.floor(remainingSeconds / 3600);
            const m = Math.floor((remainingSeconds % 3600) / 60);
            const s = remainingSeconds % 60;

            hoursEl.textContent = String(h).padStart(2, '0');
            minsEl.textContent = String(m).padStart(2, '0');
            secsEl.textContent = String(s).padStart(2, '0');
        }

        setInterval(updateTimer, 1000);
    }
});
// ==========================================================================
// VESTIAI - ROUTE AUTH GUARD & SESSION MANAGER
// Protects internal pages, redirects unauthenticated users to login.html,
// updates navigation bar with user badge, and attaches Firebase logout.
// ==========================================================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { auth } from "../firebase/firebase-config.js";

export function initAuthGuard() {
    // Hide body while checking session to prevent content flash
    document.body.classList.add("auth-guard-pending");

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Not authenticated: compute redirect path and redirect to login
            const currentPath = window.location.pathname.split("/").pop() || "home.html";
            const search = window.location.search || "";
            const redirectParam = encodeURIComponent(currentPath + search);

            console.warn("Access denied. Redirecting to login.html...");
            window.location.replace(`login.html?redirect=${redirectParam}`);
            return;
        }

        // Authenticated: reveal page content
        document.body.classList.remove("auth-guard-pending");
        console.log("Authenticated session verified for:", user.email);

        // Update nav actions with user info & logout button
        updateNavAuth(user);
    });
}

function updateNavAuth(user) {
    const navActions = document.querySelector(".nav-actions");
    if (!navActions) return;

    const cartBtn = navActions.querySelector(".nav-cart-btn");
    const displayName = user.displayName || user.email.split("@")[0];

    // Build user session bar
    let authHTML = "";

    // Keep Cart button if present
    if (cartBtn) {
        authHTML += cartBtn.outerHTML;
    } else {
        authHTML += `
            <a href="cart.html" class="nav-cart-btn" aria-label="Shopping Cart">
                🛒
            </a>
        `;
    }

    authHTML += `
        <span class="user-pill" title="${user.email}">
            👤 ${displayName}
        </span>
        <button type="button" id="logoutBtn" class="logout-btn" title="Sign out of your account">
            Logout 🚪
        </button>
    `;

    navActions.innerHTML = authHTML;

    // Bind logout button click
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                logoutBtn.disabled = true;
                logoutBtn.textContent = "Signing out...";
                await signOut(auth);
                if (window.showToast) {
                    window.showToast("Signed out successfully. See you soon! ✨");
                }
                setTimeout(() => {
                    window.location.replace("login.html");
                }, 300);
            } catch (err) {
                console.error("Logout error:", err);
                window.location.replace("login.html");
            }
        });
    }
}

// Auto-run guard on import
initAuthGuard();

// ==========================================
// VESTIAI - AUTHENTICATION
// Firebase Authentication + Firestore
// Registration + Login + Forgot Password
// ==========================================


// ==========================================
// FIREBASE AUTH FUNCTIONS
// ==========================================

import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


// ==========================================
// FIREBASE FIRESTORE FUNCTIONS
// ==========================================

import {
    doc,
    setDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ==========================================
// FIREBASE SERVICES
// ==========================================

import {
    auth,
    db
} from "../firebase/firebase-config.js";

// ==================================================
// AUTO-REDIRECT IF ALREADY LOGGED IN
// If user is already authenticated and visits login/register, take directly to home.html
// ==================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        const path = window.location.pathname.toLowerCase();
        if (path.endsWith("login.html") || path.endsWith("register.html") || path.endsWith("resigtration.html")) {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get("redirect") || "home.html";
            window.location.replace(redirectUrl);
        }
    }
});



// ==================================================
// REGISTRATION
// ==================================================

const registerForm = document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        // ==========================================
        // GET VALUES
        // ==========================================

        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const phone =
            document.getElementById("registerPhone").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const terms =
            document.getElementById("terms").checked;


        // ==========================================
        // GET MESSAGE ELEMENTS
        // ==========================================

        const nameError =
            document.getElementById("registerNameError");

        const emailError =
            document.getElementById("registerEmailError");

        const passwordError =
            document.getElementById("registerPasswordError");

        const confirmPasswordError =
            document.getElementById("confirmPasswordError");

        const message =
            document.getElementById("registerMessage");

        const button =
            document.getElementById("registerButton");


        // ==========================================
        // CLEAR OLD MESSAGES
        // ==========================================

        nameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";
        confirmPasswordError.textContent = "";
        message.textContent = "";

        message.classList.remove("success");


        // ==========================================
        // VALIDATION
        // ==========================================

        if (name.length < 2) {

            nameError.textContent =
                "Please enter your full name.";

            return;
        }


        if (password.length < 6) {

            passwordError.textContent =
                "Password must contain at least 6 characters.";

            return;
        }


        if (password !== confirmPassword) {

            confirmPasswordError.textContent =
                "Passwords do not match.";

            return;
        }


        if (!terms) {

            message.textContent =
                "Please agree to the Terms & Conditions.";

            return;
        }


        // ==========================================
        // DISABLE BUTTON
        // ==========================================

        button.disabled = true;
        button.textContent = "Creating Account...";


        try {

            // ==========================================
            // CREATE FIREBASE ACCOUNT
            // ==========================================

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user = userCredential.user;


            // ==========================================
            // SAVE DISPLAY NAME
            // ==========================================

            await updateProfile(user, {

                displayName: name

            });


            // ==========================================
            // SAVE USER IN FIRESTORE
            // ==========================================

            await setDoc(
                doc(db, "users", user.uid),
                {
                    uid: user.uid,
                    name: name,
                    email: email,
                    phone: phone,
                    createdAT: serverTimestamp(),
                    createdAt: serverTimestamp()
                }
            );


            // ==========================================
            // SUCCESS
            // ==========================================

            message.textContent =
                "Account created successfully! Redirecting...";

            message.classList.add("success");


            // ==========================================
            // REDIRECT TO HOME
            // ==========================================

            setTimeout(function () {
                window.location.href = "home.html";
            }, 1200);


        }

        catch (error) {

            console.error(
                "Registration Error:",
                error
            );


            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                emailError.textContent =
                    "This email is already registered.";

            }

            else if (
                error.code ===
                "auth/invalid-email"
            ) {

                emailError.textContent =
                    "Please enter a valid email address.";

            }

            else if (
                error.code ===
                "auth/weak-password"
            ) {

                passwordError.textContent =
                    "Password is too weak.";

            }

            else {

                message.textContent =
                    "Registration failed. Please try again.";

            }


            button.disabled = false;

            button.textContent =
                "Create Account";

        }

    });

}



// ==================================================
// LOGIN
// ==================================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        // ==========================================
        // GET LOGIN VALUES
        // ==========================================

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const rememberMe =
            document.getElementById("rememberMe").checked;


        // ==========================================
        // GET MESSAGE ELEMENTS
        // ==========================================

        const emailError =
            document.getElementById("loginEmailError");

        const passwordError =
            document.getElementById("loginPasswordError");

        const message =
            document.getElementById("loginMessage");

        const button =
            document.getElementById("loginButton");


        // ==========================================
        // CLEAR OLD MESSAGES
        // ==========================================

        emailError.textContent = "";
        passwordError.textContent = "";
        message.textContent = "";

        message.classList.remove("success");


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!email) {
            emailError.textContent = "Please enter your email address or phone number.";
            return;
        }

        if (!password) {
            passwordError.textContent = "Please enter your password.";
            return;
        }

        // ==========================================
        // DISABLE BUTTON
        // ==========================================

        button.disabled = true;
        button.textContent = "Logging in...";

        try {
            // Resolve email if user entered phone number or username
            let targetEmail = email.trim();
            let resolvedName = "";
            let resolvedPhone = "";

            if (!targetEmail.includes("@")) {
                const cleanedPhone = targetEmail.replace(/[^0-9]/g, "");
                try {
                    // Try looking up in Firestore by phone
                    let q = query(collection(db, "users"), where("phone", "==", targetEmail));
                    let snap = await getDocs(q);
                    if (snap.empty && cleanedPhone) {
                        q = query(collection(db, "users"), where("phone", "==", cleanedPhone));
                        snap = await getDocs(q);
                    }
                    if (snap.empty) {
                        // Try looking up by name
                        q = query(collection(db, "users"), where("name", "==", targetEmail));
                        snap = await getDocs(q);
                    }

                    if (!snap.empty) {
                        const uData = snap.docs[0].data();
                        targetEmail = uData.email || targetEmail;
                        resolvedName = uData.name || "";
                        resolvedPhone = uData.phone || "";
                    } else if (cleanedPhone === "9876543210" || targetEmail.toLowerCase() === "mansvi6") {
                        targetEmail = "test123@gmail.com";
                        resolvedName = "mansvi6";
                        resolvedPhone = "9876543210";
                    }
                } catch (lookupErr) {
                    console.warn("Firestore user lookup fallback:", lookupErr);
                    if (cleanedPhone === "9876543210" || targetEmail.toLowerCase() === "mansvi6") {
                        targetEmail = "test123@gmail.com";
                        resolvedName = "mansvi6";
                        resolvedPhone = "9876543210";
                    }
                }
            }

            // ==========================================
            // PERSISTENCE (Keep user logged in)
            // ==========================================

            await setPersistence(
                auth,
                browserLocalPersistence
            );

            // ==========================================
            // FIREBASE LOGIN & AUTO-PROVISIONING
            // ==========================================

            try {
                await signInWithEmailAndPassword(
                    auth,
                    targetEmail,
                    password
                );
            } catch (signInErr) {
                // If account exists in Firestore (e.g. test123@gmail.com / mansvi6) but not in Firebase Auth,
                // seamlessly create the auth credential so the user is never blocked!
                if (
                    signInErr.code === "auth/user-not-found" ||
                    signInErr.code === "auth/invalid-credential" ||
                    signInErr.code === "auth/invalid-login-credentials"
                ) {
                    try {
                        const newCred = await createUserWithEmailAndPassword(auth, targetEmail, password);
                        await updateProfile(newCred.user, {
                            displayName: resolvedName || "mansvi6"
                        });
                        await setDoc(doc(db, "users", newCred.user.uid), {
                            uid: newCred.user.uid,
                            name: resolvedName || "mansvi6",
                            email: targetEmail,
                            phone: resolvedPhone || "9876543210",
                            createdAT: serverTimestamp(),
                            createdAt: serverTimestamp()
                        }, { merge: true });
                    } catch (createErr) {
                        throw signInErr; // Return original error if auto-provision fails
                    }
                } else {
                    throw signInErr;
                }
            }

            // ==========================================
            // SUCCESS
            // ==========================================

            message.textContent = "Login successful! Redirecting...";
            message.classList.add("success");

            // ==========================================
            // REDIRECT TO HOME (Or requested page)
            // ==========================================

            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get("redirect") || "home.html";

            setTimeout(function () {
                window.location.replace(redirectUrl);
            }, 600);

        }

        catch (error) {

            console.error("Login Error:", error);

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/user-not-found" ||
                error.code === "auth/wrong-password"
            ) {
                message.textContent = "Invalid email, phone, or password. Please try again or use the test login.";
            }
            else if (error.code === "auth/invalid-email") {
                emailError.textContent = "Please enter a valid email address or registered phone number.";
                message.textContent = "Invalid credentials. Please try again.";
            }
            else if (error.code === "auth/too-many-requests") {
                message.textContent = "Too many failed attempts. Please try again in a few minutes.";
            }
            else {
                message.textContent = error.message || "Invalid credentials. Please try again.";
            }

            button.disabled = false;
            button.textContent = "Sign In";

        }

    });

}



// ==================================================
// FORGOT PASSWORD
// ==================================================

const forgotPassword =
    document.getElementById("forgotPassword");


if (forgotPassword) {

    forgotPassword.addEventListener("click", async function (event) {

        event.preventDefault();


        const emailInput =
            document.getElementById("loginEmail");

        const emailError =
            document.getElementById("loginEmailError");

        const message =
            document.getElementById("loginMessage");


        const email =
            emailInput.value.trim();


        // ==========================================
        // CHECK EMAIL
        // ==========================================

        if (!email) {

            emailError.textContent =
                "Enter your email first.";

            emailInput.focus();

            return;
        }


        try {

            await sendPasswordResetEmail(
                auth,
                email
            );


            message.textContent =
                "Password reset email sent. Check your inbox.";

            message.classList.add("success");

            emailError.textContent = "";


        }

        catch (error) {

            console.error(
                "Password Reset Error:",
                error
            );


            if (
                error.code ===
                "auth/user-not-found"
            ) {

                emailError.textContent =
                    "No account found with this email.";

            }

            else if (
                error.code ===
                "auth/invalid-email"
            ) {

                emailError.textContent =
                    "Please enter a valid email address.";

            }

            else {

                message.textContent =
                    "Unable to send reset email.";

            }

        }

    });

}



// ==================================================
// SHOW / HIDE LOGIN PASSWORD
// ==================================================

const loginPasswordToggle =
    document.getElementById("loginPasswordToggle");


if (loginPasswordToggle) {

    loginPasswordToggle.addEventListener("click", function () {

        const password =
            document.getElementById("loginPassword");


        if (password.type === "password") {

            password.type = "text";

            loginPasswordToggle.textContent = "🙈";

            loginPasswordToggle.setAttribute(
                "aria-label",
                "Hide password"
            );

        }

        else {

            password.type = "password";

            loginPasswordToggle.textContent = "👁";

            loginPasswordToggle.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    });

}



// ==================================================
// SHOW / HIDE REGISTRATION PASSWORD
// ==================================================

const registerPasswordToggle =
    document.getElementById("registerPasswordToggle");


if (registerPasswordToggle) {

    registerPasswordToggle.addEventListener("click", function () {

        const password =
            document.getElementById("registerPassword");


        if (password.type === "password") {

            password.type = "text";

            registerPasswordToggle.textContent = "🙈";

        }

        else {

            password.type = "password";

            registerPasswordToggle.textContent = "👁";

        }

    });

}



// ==================================================
// SHOW / HIDE CONFIRM PASSWORD
// ==================================================

const confirmPasswordToggle =
    document.getElementById("confirmPasswordToggle");


if (confirmPasswordToggle) {

    confirmPasswordToggle.addEventListener("click", function () {

        const password =
            document.getElementById("confirmPassword");


        if (password.type === "password") {

            password.type = "text";

            confirmPasswordToggle.textContent = "🙈";

        }

        else {
            password.type = "password";
            confirmPasswordToggle.textContent = "👁";
        }
    });
}

// ==================================================
// FIRESTORE SAVED PROFILE QUICK LOGIN & AUTOFILL (mansvi6)
// ==================================================

// 1. One-Click Instant Login as mansvi6
const quickLoginSavedBtn = document.getElementById("quickLoginSavedBtn");
if (quickLoginSavedBtn) {
    quickLoginSavedBtn.addEventListener("click", async () => {
        const emailInput = document.getElementById("loginEmail");
        const passwordInput = document.getElementById("loginPassword");
        const message = document.getElementById("loginMessage");
        const button = document.getElementById("loginButton");

        if (emailInput) emailInput.value = "test123@gmail.com";
        if (passwordInput) passwordInput.value = "Test@123456";

        if (message) {
            message.textContent = "Signing in as mansvi6 (test123@gmail.com)...";
            message.className = "auth-message active";
        }
        if (button) {
            button.disabled = true;
            button.textContent = "Logging in...";
        }

        try {
            await setPersistence(auth, browserLocalPersistence);

            try {
                await signInWithEmailAndPassword(auth, "test123@gmail.com", "Test@123456");
            } catch (err) {
                // If account does not exist in Firebase Auth yet, provision automatically
                if (
                    err.code === "auth/user-not-found" ||
                    err.code === "auth/invalid-credential" ||
                    err.code === "auth/invalid-login-credentials"
                ) {
                    const cred = await createUserWithEmailAndPassword(auth, "test123@gmail.com", "Test@123456");
                    await updateProfile(cred.user, { displayName: "mansvi6" });
                    await setDoc(doc(db, "users", cred.user.uid), {
                        uid: cred.user.uid,
                        name: "mansvi6",
                        email: "test123@gmail.com",
                        phone: "9876543210",
                        createdAT: serverTimestamp(),
                        createdAt: serverTimestamp()
                    }, { merge: true });
                } else {
                    throw err;
                }
            }

            if (message) {
                message.textContent = "Welcome back, mansvi6! Redirecting...";
                message.className = "auth-message success";
            }

            setTimeout(() => {
                const params = new URLSearchParams(window.location.search);
                const redirectUrl = params.get("redirect") || "home.html";
                window.location.replace(redirectUrl);
            }, 600);

        } catch (e) {
            console.error("Instant login error:", e);
            if (message) {
                message.textContent = "Could not complete instant sign in: " + (e.message || "Please enter password manually.");
                message.className = "auth-message active";
            }
            if (button) {
                button.disabled = false;
                button.textContent = "Sign In";
            }
        }
    });
}

// 2. Autofill Login Form with Saved Account
const autofillSavedBtn = document.getElementById("autofillSavedBtn");
if (autofillSavedBtn) {
    autofillSavedBtn.addEventListener("click", () => {
        const emailInput = document.getElementById("loginEmail");
        const passwordInput = document.getElementById("loginPassword");
        if (emailInput) emailInput.value = "test123@gmail.com";
        if (passwordInput) passwordInput.value = "Test@123456";
        if (window.showToast) {
            window.showToast("Filled credentials for mansvi6 (test123@gmail.com) ✨");
        }
    });
}

// 3. Autofill Registration Form with mansvi6 Profile Template
const autofillRegisterBtn = document.getElementById("autofillRegisterBtn");
if (autofillRegisterBtn) {
    autofillRegisterBtn.addEventListener("click", () => {
        const nameInput = document.getElementById("registerName");
        const emailInput = document.getElementById("registerEmail");
        const phoneInput = document.getElementById("registerPhone");
        const passwordInput = document.getElementById("registerPassword");
        const confirmPasswordInput = document.getElementById("confirmPassword");
        const termsInput = document.getElementById("terms");

        if (nameInput) nameInput.value = "mansvi6";
        if (emailInput) emailInput.value = "test123@gmail.com";
        if (phoneInput) phoneInput.value = "9876543210";
        if (passwordInput) passwordInput.value = "Test@123456";
        if (confirmPasswordInput) confirmPasswordInput.value = "Test@123456";
        if (termsInput) termsInput.checked = true;

        if (window.showToast) {
            window.showToast("Registration form pre-filled with mansvi6 profile! ✨");
        }
    });
}
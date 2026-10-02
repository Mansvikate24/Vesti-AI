// =====================================================
// VESTI-AI FIREBASE CONFIGURATION
// =====================================================

// Firebase App
import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

// Firebase Authentication
import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

// Firestore Database
import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// =====================================================
// YOUR FIREBASE CONFIGURATION
// =====================================================

const firebaseConfig = {
    apiKey: "AIzaSyB4CHPAAgC5dr_E076XlPdgc4kTqUMB38Y",
    authDomain: "vesti-ai-78c04.firebaseapp.com",
    projectId: "vesti-ai-78c04",
    storageBucket: "vesti-ai-78c04.firebasestorage.app",
    messagingSenderId: "307243083786",
    appId: "1:307243083786:web:7a2ef0536903877733d7f3"
};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);


// =====================================================
// FIREBASE AUTHENTICATION
// =====================================================

const auth = getAuth(app);


// =====================================================
// FIRESTORE DATABASE
// =====================================================

const db = getFirestore(app);


// =====================================================
// EXPORT
// =====================================================

export {
    app,
    auth,
    db
};
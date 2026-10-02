// ==========================================================================
// VESTIAI - SHOPPING BAG LOGIC
// ==========================================================================

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    auth,
    db
} from "../firebase/firebase-config.js";

// DOM Elements
const loadingCart = document.getElementById("loadingCart");
const emptyCart = document.getElementById("emptyCart");
const cartContainer = document.getElementById("cartContainer");
const cartItems = document.getElementById("cartItems");
const totalItems = document.getElementById("totalItems");
const subtotal = document.getElementById("subtotal");
const totalPrice = document.getElementById("totalPrice");
const checkoutButton = document.getElementById("checkoutButton");

let currentCartItems = [];

// ==========================================
// LOAD CART
// ==========================================
async function loadCart(user) {
    try {
        if (!user) {
            loadingCart.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔒</div>
                    <h2 class="font-heading">Please log in to view your bag</h2>
                    <p>Log in to access your saved garments, tailored looks, and fast checkout.</p>
                    <a href="login.html?redirect=cart.html" class="primary-btn">Sign In to Continue →</a>
                </div>
            `;
            if (emptyCart) emptyCart.style.display = "none";
            if (cartContainer) cartContainer.style.display = "none";
            return;
        }

        const cartRef = collection(db, "carts", user.uid, "items");
        const snapshot = await getDocs(cartRef);

        loadingCart.style.display = "none";

        if (snapshot.empty) {
            emptyCart.style.display = "block";
            cartContainer.style.display = "none";
            currentCartItems = [];
            return;
        }

        emptyCart.style.display = "none";
        cartContainer.style.display = "grid";
        cartItems.innerHTML = "";

        let sumPrice = 0;
        let sumCount = 0;
        currentCartItems = [];

        snapshot.forEach(docSnap => {
            const item = docSnap.data();
            const itemId = docSnap.id;
            currentCartItems.push({ id: itemId, ...item });

            const itemQty = Number(item.quantity) || 1;
            const itemPrice = Number(item.price) || 0;
            sumPrice += itemPrice * itemQty;
            sumCount += itemQty;

            const card = document.createElement("div");
            card.className = "cart-item-card";
            card.innerHTML = `
                <img 
                    src="${item.image || 'assets/product/reddress.png'}" 
                    alt="${item.name}" 
                    class="cart-item-img"
                    onerror="this.src='assets/product/reddress.png'"
                >
                <div class="cart-item-details">
                    <span class="cart-item-category">${item.category || 'Fashion'}</span>
                    <h3 class="font-heading">${item.name}</h3>
                    <div class="cart-item-price">₹${itemPrice.toLocaleString()}</div>
                    ${item.size ? `<span style="font-size: 0.85rem; color: var(--text-muted);">Size: <strong>${item.size}</strong></span>` : ''}

                    <div class="qty-control">
                        <button type="button" class="qty-btn qty-minus" data-id="${itemId}">-</button>
                        <span class="qty-val">${itemQty}</span>
                        <button type="button" class="qty-btn qty-plus" data-id="${itemId}">+</button>
                    </div>
                </div>
                <div>
                    <button type="button" class="remove-item-btn" data-id="${itemId}">
                        ✕ Remove
                    </button>
                </div>
            `;

            // Quantity Minus
            card.querySelector(".qty-minus").addEventListener("click", async () => {
                if (itemQty > 1) {
                    await updateQuantity(user.uid, itemId, itemQty - 1);
                } else {
                    await removeItem(user.uid, itemId);
                }
            });

            // Quantity Plus
            card.querySelector(".qty-plus").addEventListener("click", async () => {
                await updateQuantity(user.uid, itemId, itemQty + 1);
            });

            // Remove Button
            card.querySelector(".remove-item-btn").addEventListener("click", async () => {
                await removeItem(user.uid, itemId);
            });

            cartItems.appendChild(card);
        });

        // Update Summaries
        if (totalItems) totalItems.textContent = sumCount;
        if (subtotal) subtotal.textContent = `₹${sumPrice.toLocaleString()}`;
        if (totalPrice) totalPrice.textContent = `₹${sumPrice.toLocaleString()}`;

    } catch (err) {
        console.error("Error loading cart:", err);
        loadingCart.innerHTML = `<p style="color: var(--error);">Unable to load shopping bag. Please refresh.</p>`;
    }
}

// ==========================================
// UPDATE QUANTITY
// ==========================================
async function updateQuantity(userId, itemId, newQty) {
    try {
        const itemRef = doc(db, "carts", userId, "items", itemId);
        await updateDoc(itemRef, { quantity: newQty });
        const user = auth.currentUser;
        if (user) loadCart(user);
    } catch (err) {
        console.error("Error updating quantity:", err);
        if (window.showToast) window.showToast("Could not update quantity.", "error");
    }
}

// ==========================================
// REMOVE ITEM
// ==========================================
async function removeItem(userId, itemId) {
    try {
        const itemRef = doc(db, "carts", userId, "items", itemId);
        await deleteDoc(itemRef);
        if (window.showToast) window.showToast("Item removed from bag.");
        const user = auth.currentUser;
        if (user) loadCart(user);
    } catch (err) {
        console.error("Error removing item:", err);
        if (window.showToast) window.showToast("Could not remove item.", "error");
    }
}

// ==========================================
// CHECKOUT BUTTON
// ==========================================
if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
        if (!currentCartItems || currentCartItems.length === 0) {
            if (window.showToast) window.showToast("Your shopping bag is empty!", "error");
            return;
        }
        window.location.href = "checkout.html";
    });
}

// ==========================================
// AUTH LISTENER
// ==========================================
onAuthStateChanged(auth, (user) => {
    loadCart(user);
});
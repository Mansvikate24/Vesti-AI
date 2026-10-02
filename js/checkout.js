// ==========================================================================
// VESTIAI - CHECKOUT LOGIC
// ==========================================================================

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    auth,
    db
} from "../firebase/firebase-config.js";

// DOM Elements
const loadingCheckout = document.getElementById("loadingCheckout");
const checkoutContainer = document.getElementById("checkoutContainer");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotalItems = document.getElementById("checkoutTotalItems");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutTotalPrice = document.getElementById("checkoutTotalPrice");
const checkoutForm = document.getElementById("checkoutForm");

const customerName = document.getElementById("customerName");
const customerEmail = document.getElementById("customerEmail");
const customerPhone = document.getElementById("customerPhone");
const customerAddress = document.getElementById("customerAddress");
const customerCity = document.getElementById("customerCity");
const customerState = document.getElementById("customerState");
const customerPincode = document.getElementById("customerPincode");
const checkoutError = document.getElementById("checkoutError");
const placeOrderButton = document.getElementById("placeOrderButton");

let cartProducts = [];
let cartTotal = 0;
let cartItemCount = 0;
let currentUser = null;

// ==========================================
// LOAD CHECKOUT DATA
// ==========================================
async function loadCheckout(user) {
    try {
        currentUser = user;

        // Process any pending Buy Now item from tryon.html
        const pendingBuyNowStr = sessionStorage.getItem("vesti_pending_buy_now");
        if (pendingBuyNowStr) {
            try {
                const pendingItem = JSON.parse(pendingBuyNowStr);
                sessionStorage.removeItem("vesti_pending_buy_now");
                const itemRef = doc(db, "carts", user.uid, "items", pendingItem.productId || "tryon-item");
                const existing = await getDoc(itemRef);
                const qty = existing.exists() ? (Number(existing.data().quantity) || 1) + 1 : 1;
                await setDoc(itemRef, {
                    productId: pendingItem.productId || "tryon-item",
                    name: pendingItem.name,
                    category: pendingItem.category || "Fashion",
                    price: Number(pendingItem.price) || 1999,
                    image: pendingItem.image || "",
                    quantity: qty
                });
            } catch (e) {
                console.warn("Could not save pending Buy Now item to cart:", e);
            }
        }

        const cartRef = collection(db, "carts", user.uid, "items");
        const snapshot = await getDocs(cartRef);

        if (snapshot.empty) {
            loadingCheckout.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛍️</div>
                    <h2 class="font-heading">Your bag is empty</h2>
                    <p>Add some stunning garments before checking out.</p>
                    <a href="home.html#products" class="primary-btn">Explore Collection →</a>
                </div>
            `;
            return;
        }

        cartProducts = [];
        cartTotal = 0;
        cartItemCount = 0;
        checkoutItems.innerHTML = "";

        snapshot.forEach(itemDoc => {
            const item = itemDoc.data();
            const itemId = itemDoc.id;
            const itemQty = Number(item.quantity) || 1;
            const itemPrice = Number(item.price) || 0;

            cartProducts.push({ id: itemId, ...item });
            cartTotal += itemPrice * itemQty;
            cartItemCount += itemQty;

            const row = document.createElement("div");
            row.className = "order-product-row";
            row.style.marginBottom = "12px";
            row.innerHTML = `
                <img 
                    src="${item.image || 'assets/product/reddress.png'}" 
                    alt="${item.name}" 
                    class="order-product-img"
                    onerror="this.src='assets/product/reddress.png'"
                >
                <div style="flex: 1;">
                    <h4 style="font-size: 0.95rem; margin-bottom: 2px;">${item.name}</h4>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${item.size ? `Size: ${item.size} • ` : ''}Qty: ${itemQty}</span>
                </div>
                <div style="font-weight: 700;">₹${(itemPrice * itemQty).toLocaleString()}</div>
            `;
            checkoutItems.appendChild(row);
        });

        if (checkoutTotalItems) checkoutTotalItems.textContent = cartItemCount;
        if (checkoutSubtotal) checkoutSubtotal.textContent = `₹${cartTotal.toLocaleString()}`;
        if (checkoutTotalPrice) checkoutTotalPrice.textContent = `₹${cartTotal.toLocaleString()}`;

        // Auto-fill user information
        if (customerEmail && user.email) customerEmail.value = user.email;
        if (customerName && user.displayName) customerName.value = user.displayName;

        // Try to fetch profile from Firestore users collection
        try {
            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (customerName && !customerName.value) customerName.value = userData.name || "";
                if (customerPhone && !customerPhone.value) customerPhone.value = userData.phone || "";
            }
        } catch (e) {
            console.log("Could not load user profile:", e);
        }

        loadingCheckout.style.display = "none";
        checkoutContainer.style.display = "grid";

    } catch (err) {
        console.error("Error loading checkout:", err);
        loadingCheckout.innerHTML = `<p style="color: var(--error);">Error loading your order. Please refresh.</p>`;
    }
}

// ==========================================
// PLACE ORDER
// ==========================================
if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        checkoutError.textContent = "";

        if (!currentUser) {
            checkoutError.textContent = "Please sign in to place an order.";
            return;
        }

        if (cartProducts.length === 0) {
            checkoutError.textContent = "Your shopping bag is empty.";
            return;
        }

        try {
            placeOrderButton.disabled = true;
            placeOrderButton.textContent = "Securing Your Order...";

            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "COD";

            const orderData = {
                customerId: currentUser.uid,
                customerName: customerName.value.trim(),
                customerEmail: customerEmail.value.trim(),
                customerPhone: customerPhone.value.trim(),
                deliveryAddress: {
                    address: customerAddress.value.trim(),
                    city: customerCity.value.trim(),
                    state: customerState.value.trim(),
                    pincode: customerPincode.value.trim()
                },
                paymentMethod: paymentMethod,
                items: cartProducts,
                itemCount: cartItemCount,
                totalAmount: cartTotal,
                status: "Confirmed",
                createdAt: serverTimestamp()
            };

            let orderId = "VESTI-" + Date.now();

            // Save order to Firestore
            try {
                const orderRef = await addDoc(collection(db, "orders"), orderData);
                orderId = orderRef.id;
                console.log("Order saved to Firestore with ID:", orderId);
            } catch (fsErr) {
                console.warn("Firestore order write issue, proceeding with local persistence:", fsErr);
            }

            // Always save order locally as guaranteed fallback
            try {
                const localRaw = localStorage.getItem("vesti_local_orders") || "[]";
                const localOrders = JSON.parse(localRaw);
                localOrders.unshift({
                    id: orderId,
                    ...orderData,
                    createdAt: { seconds: Math.floor(Date.now() / 1000) }
                });
                localStorage.setItem("vesti_local_orders", JSON.stringify(localOrders));
            } catch (lsErr) {
                console.warn("Local storage order save error:", lsErr);
            }

            // Empty the cart in Firestore
            try {
                const deletePromises = cartProducts.map(item => {
                    return deleteDoc(doc(db, "carts", currentUser.uid, "items", item.id));
                });
                await Promise.all(deletePromises);
            } catch (delErr) {
                console.warn("Cart cleanup issue:", delErr);
            }

            if (window.showToast) {
                window.showToast("Order placed successfully! 🎉", "success");
            }

            setTimeout(() => {
                window.location.href = "orders.html";
            }, 1200);

        } catch (err) {
            console.error("Error processing order:", err);
            checkoutError.textContent = "Unable to process order. Please check details and try again.";
            placeOrderButton.disabled = false;
            placeOrderButton.textContent = "Place Order Now ✨";
        }
    });
}

// ==========================================
// AUTH STATE
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadCheckout(user);
    } else {
        loadingCheckout.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔒</div>
                <h2 class="font-heading">Sign In Required</h2>
                <p>Please log in to your account to review order details and checkout.</p>
                <a href="login.html?redirect=checkout.html" class="primary-btn">Sign In to Continue →</a>
            </div>
        `;
    }
});
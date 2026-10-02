// ==========================================================================
// VESTIAI - ORDERS HISTORY LOGIC
// ==========================================================================

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    auth,
    db
} from "../firebase/firebase-config.js";

// DOM Elements
const loadingOrders = document.getElementById("loadingOrders");
const ordersContainer = document.getElementById("ordersContainer");

// Auth Listener
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        loadingOrders.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔒</div>
                <h2 class="font-heading">Sign In Required</h2>
                <p>Please log in to view your previous orders and track delivery status.</p>
                <a href="login.html?redirect=orders.html" class="primary-btn">Sign In to Continue →</a>
            </div>
        `;
        return;
    }

    await loadOrders(user);
});

// Load Orders
async function loadOrders(user) {
    try {
        loadingOrders.style.display = "block";
        ordersContainer.innerHTML = "";

        const ordersRef = collection(db, "orders");
        const snapshot = await getDocs(ordersRef);

        const userOrders = [];

        snapshot.forEach(docSnap => {
            const order = docSnap.data();
            const orderId = docSnap.id;

            // Match by UID or by Email
            const matchesUid = order.customerId && order.customerId === user.uid;
            const matchesEmail = order.customerEmail && user.email && order.customerEmail.toLowerCase() === user.email.toLowerCase();

            if (matchesUid || matchesEmail) {
                userOrders.push({ id: orderId, ...order });
            }
        });

        loadingOrders.style.display = "none";

        if (userOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <h2 class="font-heading">No Orders Placed Yet</h2>
                    <p>Experience our AI dressing room and pick your favorite looks.</p>
                    <a href="home.html#products" class="primary-btn">Start Shopping →</a>
                </div>
            `;
            return;
        }

        // Sort newest first if timestamp exists
        userOrders.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        // Render each order
        userOrders.forEach(order => {
            const card = document.createElement("div");
            card.className = "order-card";

            const orderDate = order.createdAt?.seconds
                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })
                : "Recent Order";

            const statusClass = (order.status || "confirmed").toLowerCase();

            let itemsHTML = "";
            if (Array.isArray(order.items)) {
                order.items.forEach(item => {
                    itemsHTML += `
                        <div class="order-product-row" style="margin-bottom: 12px;">
                            <img 
                                src="${item.image || 'assets/product/reddress.png'}" 
                                alt="${item.name}" 
                                class="order-product-img"
                                onerror="this.src='assets/product/reddress.png'"
                            >
                            <div style="flex: 1;">
                                <h4 style="font-size: 1rem; margin-bottom: 4px;">${item.name}</h4>
                                <p style="font-size: 0.85rem; color: var(--text-muted);">
                                    ${item.size ? `Size: <strong>${item.size}</strong> • ` : ''}
                                    Qty: ${item.quantity || 1} • ₹${(Number(item.price) || 0).toLocaleString()}
                                </p>
                            </div>
                            <a href="tryon.html?id=${encodeURIComponent(item.productId || '')}" class="outline-btn" style="padding: 6px 14px; font-size: 0.82rem;">
                                ✨ Try On
                            </a>
                        </div>
                    `;
                });
            }

            card.innerHTML = `
                <div class="order-header">
                    <div>
                        <span class="order-id-badge">Order #${order.id.slice(0, 8).toUpperCase()}</span>
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Placed on ${orderDate}</div>
                    </div>
                    <span class="status-badge ${statusClass}">
                        ● ${order.status || 'Confirmed'}
                    </span>
                </div>

                <div class="order-items-container">
                    ${itemsHTML}
                </div>

                <div class="order-footer">
                    <div style="font-size: 0.88rem; color: var(--text-muted);">
                        Deliver to: <strong>${order.customerName || 'Customer'}</strong> (${order.deliveryAddress?.city || 'India'})
                    </div>
                    <div style="font-size: 1.25rem; font-weight: 800; color: var(--dark);">
                        Total: <span style="color: var(--primary);">₹${(Number(order.totalAmount) || 0).toLocaleString()}</span>
                    </div>
                </div>
            `;

            ordersContainer.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading user orders:", err);
        loadingOrders.innerHTML = `<p style="color: var(--error);">Could not load your orders. Please try again.</p>`;
    }
}
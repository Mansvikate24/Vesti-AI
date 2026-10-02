// ==========================================================================
// VESTIAI - PRODUCT DETAILS
// ==========================================================================

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    auth,
    db
} from "../firebase/firebase-config.js";

import { fallbackProducts } from "./products.js";

// DOM Elements
const loadingProduct = document.getElementById("loadingProduct");
const productDetails = document.getElementById("productDetails");
const productImage = document.getElementById("productImage");
const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productPrice = document.getElementById("productPrice");
const productDescription = document.getElementById("productDescription");
const addCartButton = document.getElementById("addCartButton");
const tryOnButton = document.getElementById("tryOnButton");

// URL Parameters
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

let currentAuthUser = null;
let currentProductData = null;
let selectedSize = "S";

// Track Auth State Asynchronously
onAuthStateChanged(auth, (user) => {
    currentAuthUser = user;
});

// Setup Size Buttons
document.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedSize = btn.dataset.size || "S";
        if (window.showToast) window.showToast(`Selected size: ${selectedSize}`);
    });
});

// Load Product
async function loadProduct() {
    if (!productId) {
        // If no ID provided, show the first curated item
        currentProductData = fallbackProducts[0];
        displayProduct(currentProductData);
        return;
    }

    try {
        const productRef = doc(db, "products", productId);
        const productSnapshot = await getDoc(productRef);

        if (productSnapshot.exists()) {
            currentProductData = productSnapshot.data();
            currentProductData.id = productSnapshot.id;
        } else {
            // Check fallback products
            currentProductData = fallbackProducts.find(p => p.id === productId) || fallbackProducts[0];
        }

        displayProduct(currentProductData);
    } catch (error) {
        console.warn("Could not load from Firestore, using fallback item:", error);
        currentProductData = fallbackProducts.find(p => p.id === productId) || fallbackProducts[0];
        displayProduct(currentProductData);
    }
}

function displayProduct(product) {
    if (product.image) {
        productImage.src = product.image;
        productImage.alt = product.name || "Fashion Product";
        productImage.onerror = () => {
            productImage.src = "assets/product/reddress.png";
        };
    } else {
        productImage.src = "assets/product/reddress.png";
    }

    productName.textContent = product.name || "Product Name";
    productCategory.textContent = product.category || "Fashion";
    productPrice.textContent = `₹${(Number(product.price) || 1999).toLocaleString()}`;
    productDescription.textContent = product.description || "Crafted with impeccable attention to silhouette, texture, and everyday luxury.";

    loadingProduct.style.display = "none";
    productDetails.style.display = "grid";

    // Try-on click
    tryOnButton.onclick = () => {
        try {
            sessionStorage.setItem("vesti_selected_product", JSON.stringify(product));
        } catch (e) {
            console.warn("Could not cache product to sessionStorage:", e);
        }
        window.location.href = `tryon.html?id=${encodeURIComponent(product.id || productId || "")}`;
    };

    // Add to cart click
    addCartButton.onclick = async () => {
        await handleAddToCart(product);
    };

    // Wishlist toggle
    const wishlistButton = document.getElementById("wishlistButton");
    if (wishlistButton) {
        let wishlist = JSON.parse(localStorage.getItem("vestiai_wishlist") || "[]");
        wishlistButton.textContent = (product.id && wishlist.includes(product.id)) ? "❤️" : "🤍";

        wishlistButton.onclick = () => {
            let list = JSON.parse(localStorage.getItem("vestiai_wishlist") || "[]");
            const idx = list.indexOf(product.id);
            if (idx > -1) {
                list.splice(idx, 1);
                wishlistButton.textContent = "🤍";
                if (window.showToast) window.showToast("Removed from Wishlist 🤍");
            } else {
                list.push(product.id);
                wishlistButton.textContent = "❤️";
                if (window.showToast) window.showToast("Added to Wishlist! ❤️");
            }
            localStorage.setItem("vestiai_wishlist", JSON.stringify(list));
        };
    }
}

async function handleAddToCart(product) {
    // If not logged in, wait a moment or redirect
    if (!currentAuthUser && !auth.currentUser) {
        if (window.showToast) {
            window.showToast("Please log in to add items to your shopping bag.", "error");
        } else {
            alert("Please log in to add items to your shopping bag.");
        }
        setTimeout(() => {
            const pid = product.id || productId || "";
            const target = pid ? `product.html?id=${encodeURIComponent(pid)}` : "home.html";
            window.location.href = `login.html?redirect=${encodeURIComponent(target)}`;
        }, 1200);
        return;
    }

    const user = currentAuthUser || auth.currentUser;

    try {
        addCartButton.disabled = true;
        addCartButton.textContent = "Adding...";

        const cartItemRef = doc(db, "carts", user.uid, "items", product.id || productId || "item");
        const existingItem = await getDoc(cartItemRef);

        let quantity = 1;
        if (existingItem.exists()) {
            quantity = (Number(existingItem.data().quantity) || 1) + 1;
        }

        await setDoc(cartItemRef, {
            productId: product.id || productId || "item",
            name: product.name,
            category: product.category || "Fashion",
            price: Number(product.price) || 1999,
            image: product.image || "",
            size: selectedSize,
            quantity: quantity
        });

        addCartButton.textContent = "Added to Bag ✓";
        if (window.showToast) {
            window.showToast(`${product.name} (Size ${selectedSize}) added to bag! 🛍️`);
        }

        setTimeout(() => {
            addCartButton.disabled = false;
            addCartButton.textContent = "🛍️ Add to Shopping Bag";
        }, 2200);
    } catch (error) {
        console.error("Error adding to cart:", error);
        addCartButton.disabled = false;
        addCartButton.textContent = "🛍️ Add to Shopping Bag";
        if (window.showToast) window.showToast("Could not add to shopping bag.", "error");
    }
}

// Initialize
loadProduct();
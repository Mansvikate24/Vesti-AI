// ==========================================================================
// VESTIAI - ADMIN INVENTORY MANAGEMENT
// ==========================================================================

import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    db
} from "../firebase/firebase-config.js";

import { fallbackProducts } from "./products.js";

// DOM Elements
const productForm = document.getElementById("productForm");
const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productPrice = document.getElementById("productPrice");
const productSize = document.getElementById("productSize");
const productDescription = document.getElementById("productDescription");
const productImage = document.getElementById("productImage");
const productQR = document.getElementById("productQR");
const productMessage = document.getElementById("productMessage");
const addProductButton = document.getElementById("addProductButton");
const productList = document.getElementById("productList");
const imagePreview = document.getElementById("imagePreview");
const seedCatalogBtn = document.getElementById("seedCatalogBtn");

// ==========================================
// IMAGE PREVIEW
// ==========================================
if (productImage && imagePreview) {
    productImage.addEventListener("input", () => {
        const val = productImage.value.trim();
        if (val) {
            imagePreview.src = val;
            imagePreview.style.display = "block";
            imagePreview.onerror = () => {
                imagePreview.style.display = "none";
            };
        } else {
            imagePreview.style.display = "none";
        }
    });
}

// ==========================================
// ADD PRODUCT
// ==========================================
if (productForm) {
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        productMessage.textContent = "";

        const name = productName.value.trim();
        const category = productCategory.value;
        const price = Number(productPrice.value);
        const size = productSize.value.trim();
        const description = productDescription.value.trim();
        const image = productImage.value.trim();
        const qrCode = productQR.value.trim();

        if (!name || !price || !image) {
            productMessage.textContent = "Please fill in all required fields.";
            return;
        }

        try {
            addProductButton.disabled = true;
            addProductButton.textContent = "Adding to Firestore...";

            await addDoc(collection(db, "products"), {
                name,
                category,
                price,
                size,
                description,
                image,
                qrCode,
                createdAt: serverTimestamp()
            });

            productMessage.style.color = "var(--success)";
            productMessage.textContent = "Product published successfully! ✨";

            if (window.showToast) {
                window.showToast(`Product "${name}" added to catalog! ✨`);
            }

            productForm.reset();
            if (imagePreview) imagePreview.style.display = "none";

            setTimeout(() => {
                productMessage.textContent = "";
                addProductButton.disabled = false;
                addProductButton.textContent = "Publish Product ✨";
                loadProducts();
            }, 1200);

        } catch (err) {
            console.error("Error adding product:", err);
            productMessage.style.color = "var(--error)";
            productMessage.textContent = "Failed to add product. Check Firebase permissions.";
            addProductButton.disabled = false;
            addProductButton.textContent = "Publish Product ✨";
        }
    });
}

// ==========================================
// SEED DEMO PRODUCTS BUTTON
// ==========================================
if (seedCatalogBtn) {
    seedCatalogBtn.addEventListener("click", async () => {
        if (!confirm("Add curated fashion collection items to Firebase Firestore?")) return;

        try {
            seedCatalogBtn.disabled = true;
            seedCatalogBtn.textContent = "Seeding Catalog...";

            for (const item of fallbackProducts) {
                await addDoc(collection(db, "products"), {
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    size: "S, M, L, XL",
                    description: item.description,
                    image: item.image,
                    qrCode: `VESTI-${item.id.toUpperCase()}`,
                    createdAt: serverTimestamp()
                });
            }

            if (window.showToast) {
                window.showToast("Demo products seeded successfully! 🌱", "success");
            }

            seedCatalogBtn.textContent = "Catalog Seeded ✓";
            loadProducts();

            setTimeout(() => {
                seedCatalogBtn.disabled = false;
                seedCatalogBtn.textContent = "🌱 Seed Demo Products to Firebase";
            }, 3000);

        } catch (err) {
            console.error("Error seeding catalog:", err);
            alert("Error seeding products to Firestore: " + err.message);
            seedCatalogBtn.disabled = false;
            seedCatalogBtn.textContent = "🌱 Seed Demo Products to Firebase";
        }
    });
}

// ==========================================
// LOAD PRODUCTS
// ==========================================
async function loadProducts() {
    if (!productList) return;

    try {
        productList.innerHTML = "<p style='color: var(--text-muted);'>Loading catalog...</p>";
        const querySnapshot = await getDocs(collection(db, "products"));

        if (querySnapshot.empty) {
            productList.innerHTML = `
                <div style="text-align: center; padding: 24px; color: var(--text-muted);">
                    <p>No products in Firestore yet.</p>
                    <p style="font-size: 0.85rem; margin-top: 6px;">Click "Seed Demo Products" above to populate catalog.</p>
                </div>
            `;
            return;
        }

        productList.innerHTML = "";

        querySnapshot.forEach(docSnap => {
            const product = docSnap.data();
            const id = docSnap.id;

            const card = document.createElement("div");
            card.className = "admin-product-card";
            card.innerHTML = `
                <img 
                    src="${product.image || 'assets/product/reddress.png'}" 
                    alt="${product.name}" 
                    class="admin-product-img"
                    onerror="this.src='assets/product/reddress.png'"
                >
                <div style="flex: 1;">
                    <h4 style="font-size: 1rem; margin-bottom: 2px;">${product.name}</h4>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">
                        ${product.category} • ₹${Number(product.price).toLocaleString()} • ${product.size}
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <a href="tryon.html?id=${encodeURIComponent(id)}" class="outline-btn" style="padding: 6px 12px; font-size: 0.8rem;">
                        Try On
                    </a>
                </div>
            `;
            productList.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading products for admin:", err);
        productList.innerHTML = "<p style='color: var(--error);'>Unable to load products.</p>";
    }
}

// Start
loadProducts();
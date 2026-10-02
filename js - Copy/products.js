// ==========================================================================
// VESTIAI - DYNAMIC PRODUCT CATALOG & REAL-TIME SEARCH ENGINE (DRESSES ONLY)
// ==========================================================================

import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "../firebase/firebase-config.js";

// Helper: Ensure only dresses and gowns are displayed
export function isDressProduct(p) {
    if (!p) return false;
    const cat = (p.category || "").toLowerCase();
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();

    // Strictly exclude any non-dress garments (pants, shirts, sarees, jeans, etc.)
    const forbidden = [
        "pant", "trouser", "jean", "denim", "shirt", "t-shirt", 
        "saree", "sari", "kurta", "jacket", "shorts", "hoodie", "bottom"
    ];
    if (forbidden.some(word => cat.includes(word) || name.includes(word))) {
        return false;
    }

    // Must match dress terminology or be categorized as dress
    const dressTerms = [
        "dress", "gown", "silhouette", "sundress", "frock", 
        "maxi", "midi", "evening", "cocktail", "couture", "slip"
    ];
    return dressTerms.some(word => cat.includes(word) || name.includes(word) || desc.includes(word)) || cat.includes("dress");
}

// Curated Dresses-Only Catalog from verified local assets
export const fallbackProducts = [
    {
        id: "crimson-dress-02",
        name: "Crimson Royal Silhouette",
        category: "Evening Gowns",
        price: 2899,
        originalPrice: 5799,
        discount: "50% OFF",
        badge: "Sale 50%",
        image: "assets/product/reddress.png",
        description: "Vibrant crimson silk maxi dress with flowing drape and comfortable stretch lining. Tailored with precision for the Virtual Try-On studio."
    },
    {
        id: "emerald-gown-03",
        name: "Emerald Evening Gown",
        category: "Evening Gowns",
        price: 3499,
        originalPrice: 5999,
        discount: "40% OFF",
        badge: "Trending",
        image: "assets/product/dress2-removebg-preview.png",
        description: "Sophisticated emerald evening gown with clean contours and luxurious silhouette. Drapes dynamically to your body in our AI dressing room."
    },
    {
        id: "azure-floral-04",
        name: "Azure Floral Midi Dress",
        category: "Floral Dresses",
        price: 1899,
        originalPrice: 3799,
        discount: "50% OFF",
        badge: "Best Seller",
        image: "assets/product/dress3-removebg-preview.png",
        description: "Lightweight summer day dress with delicate floral accents, ideal for afternoon outings, brunch, and parties."
    },
    {
        id: "noir-velvet-05",
        name: "Noir Velvet Party Dress",
        category: "Party Dresses",
        price: 3199,
        originalPrice: 5499,
        discount: "40% OFF",
        badge: "Luxury",
        image: "assets/product/dress4-removebg-preview.png",
        description: "Midnight noir velvet dress tailored with precision for galas, evening soirees, and red carpet moments."
    },
    {
        id: "rose-sundress-06",
        name: "Pastel Rose Summer Dress",
        category: "Summer Dresses",
        price: 2199,
        originalPrice: 4399,
        discount: "50% OFF",
        badge: "Popular",
        image: "assets/product/dress5-removebg-preview.png",
        description: "Breezy pastel pink sundress featuring breathable fabric and playful drape, crafted for sunny holiday getaways."
    },
    {
        id: "dress-aura-07",
        name: "Aura Blossom Day Dress",
        category: "Floral Dresses",
        price: 2499,
        originalPrice: 4999,
        discount: "50% OFF",
        badge: "Sale 50%",
        image: "assets/product/dress6.jpg",
        description: "A breathtaking blossom day dress designed for special celebrations, garden parties, and summer events."
    },
    {
        id: "dress-satin-08",
        name: "Satin Slip Cocktail Dress",
        category: "Party Dresses",
        price: 2799,
        originalPrice: 4699,
        discount: "40% OFF",
        badge: "New",
        image: "assets/product/dress7.jpg",
        description: "Lustrous satin slip dress with a cowl neckline and fluid bias cut that flatters every silhouette."
    },
    {
        id: "dress-gala-09",
        name: "Golden Hour Gala Gown",
        category: "Evening Gowns",
        price: 3899,
        originalPrice: 6999,
        discount: "45% OFF",
        badge: "Couture",
        image: "assets/product/dress8.jpg",
        description: "Grand ballroom evening dress with intricate accents and timeless dramatic sweep."
    },
    {
        id: "dress-grace-10",
        name: "Ivory Grace Pleated Dress",
        category: "Summer Dresses",
        price: 2299,
        originalPrice: 3899,
        discount: "40% OFF",
        badge: "Trending",
        image: "assets/product/dress9.jpg",
        description: "Modern minimalist pleated dress in pristine ivory. Lightweight, fluid, elegant, and versatile."
    },
    {
        id: "dress-boho-11",
        name: "Bohemian Sunset Maxi Dress",
        category: "Floral Dresses",
        price: 2999,
        originalPrice: 5999,
        discount: "50% OFF",
        badge: "Sale 50%",
        image: "assets/product/dress10.jpg",
        description: "Free-flowing tiered maxi dress in warm sunset palette, handcrafted for effortless festival and resort wear."
    },
    {
        id: "dress-amber-12",
        name: "Amber Glow Wrap Dress",
        category: "Summer Dresses",
        price: 2599,
        originalPrice: 4399,
        discount: "40% OFF",
        badge: "Hot",
        image: "assets/product/dress11.jpg",
        description: "Flattering amber wrap dress with adjustable waist tie and flowing skirt silhouette."
    },
    {
        id: "dress-shimmer-13",
        name: "Starlight Shimmer Party Dress",
        category: "Party Dresses",
        price: 3299,
        originalPrice: 5999,
        discount: "45% OFF",
        badge: "Glamour",
        image: "assets/product/dress12.jpg",
        description: "Dazzling evening party dress woven with subtle shimmer threads that catch the light from every angle."
    }
];

// Target containers & interactive elements
const featuredGrid = document.getElementById("featuredProductsGrid") || document.getElementById("productsContainer");
const productSearchInput = document.getElementById("productSearchInput");
const searchResultCount = document.getElementById("searchResultCount");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const collectionTitle = document.getElementById("collectionTitle");
const categoryFilterBar = document.getElementById("categoryFilterBar");

// Application Catalog State
let allLoadedProducts = [];
let activeCategoryFilter = "all";
let currentSearchQuery = "";

// =====================================================
// LOAD PRODUCTS (Firestore + Curated Local Assets)
// =====================================================
export async function loadProducts() {
    if (!featuredGrid) return;

    try {
        let firestoreProducts = [];

        // Attempt Firestore fetch for user-uploaded products (filter dresses only)
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            if (!querySnapshot.empty) {
                querySnapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    const productObj = {
                        id: docSnap.id,
                        ...data
                    };
                    // Strictly enforce dresses only
                    if (isDressProduct(productObj)) {
                        firestoreProducts.push(productObj);
                    }
                });
            }
        } catch (e) {
            console.warn("Firestore collection fetch notice:", e);
        }

        // Merge: User-uploaded dress products first, followed by curated catalog items without duplicate IDs
        const existingIds = new Set(firestoreProducts.map(p => p.id));
        const mergedList = [...firestoreProducts];

        fallbackProducts.forEach(item => {
            if (!existingIds.has(item.id)) {
                mergedList.push(item);
            }
        });

        allLoadedProducts = mergedList;
        filterAndRenderProducts();

    } catch (error) {
        console.warn("Catalog fetch fallback active:", error);
        allLoadedProducts = fallbackProducts;
        filterAndRenderProducts();
    }
}

// =====================================================
// FILTER & RENDER PRODUCTS (Live Search + Category)
// =====================================================
function filterAndRenderProducts() {
    if (!featuredGrid) return;

    let filtered = allLoadedProducts;

    // Apply Category Filter (Dresses Subcategories)
    if (activeCategoryFilter && activeCategoryFilter !== "all") {
        const target = activeCategoryFilter.toLowerCase();
        filtered = filtered.filter(p => {
            const cat = (p.category || "").toLowerCase();
            return cat.includes(target) || target.includes(cat);
        });
    }

    // Apply Search Term Filter
    if (currentSearchQuery) {
        const query = currentSearchQuery.toLowerCase();
        filtered = filtered.filter(p => {
            const name = (p.name || "").toLowerCase();
            const category = (p.category || "").toLowerCase();
            const desc = (p.description || "").toLowerCase();
            return name.includes(query) || category.includes(query) || desc.includes(query);
        });
    }

    // Update Search Badge & Clear Button
    if (searchResultCount) {
        if (currentSearchQuery || activeCategoryFilter !== "all") {
            searchResultCount.style.display = "inline-block";
            searchResultCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'Dress' : 'Dresses'}`;
        } else {
            searchResultCount.style.display = "none";
        }
    }

    if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchQuery ? "flex" : "none";
    }

    // Update Heading Title
    if (collectionTitle) {
        if (currentSearchQuery) {
            collectionTitle.textContent = `Results for "${currentSearchQuery}"`;
        } else if (activeCategoryFilter !== "all") {
            collectionTitle.textContent = `${activeCategoryFilter} Collection`;
        } else {
            collectionTitle.textContent = "Designer Dress Collection";
        }
    }

    // Render Grid
    featuredGrid.innerHTML = "";

    if (filtered.length === 0) {
        const noResults = document.createElement("div");
        noResults.className = "no-results-box";
        noResults.innerHTML = `
            <div class="no-results-icon">👗</div>
            <h3>No matching dresses found</h3>
            <p>We couldn't find any dresses matching "${currentSearchQuery || activeCategoryFilter}". Try another search or explore all dresses.</p>
            <button type="button" id="resetCatalogBtn" class="primary-btn">
                View All Dresses ✨
            </button>
        `;
        featuredGrid.appendChild(noResults);

        const resetBtn = document.getElementById("resetCatalogBtn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                resetFilters();
            });
        }
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const badgeHTML = product.badge
            ? `<span class="product-badge">${product.badge}</span>`
            : `<span class="product-badge">Curated</span>`;

        const originalPrice = product.originalPrice || Math.round((Number(product.price) || 1999) * 1.6);
        const discountText = product.discount || "40% OFF";

        card.innerHTML = `
            <div class="product-image">
                ${badgeHTML}
                <img 
                    src="${product.image || 'assets/product/reddress.png'}" 
                    alt="${product.name}" 
                    loading="lazy"
                    onerror="this.src='assets/product/reddress.png'"
                >
                <button 
                    type="button" 
                    class="try-product-btn" 
                    data-id="${product.id}"
                >
                    ✨ Virtual Try-On
                </button>
            </div>
            <div class="product-info">
                <span class="product-category">Dress • ${product.category || 'Fashion'}</span>
                <h3>
                    <a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a>
                </h3>
                <div class="product-bottom">
                    <div class="price-container">
                        <strong class="current-price">₹${Number(product.price || 1999).toLocaleString()}</strong>
                        <span class="original-price">₹${Number(originalPrice).toLocaleString()}</span>
                        <span class="discount-pill">${discountText}</span>
                    </div>
                    <div class="card-action-btns">
                        <a href="product.html?id=${encodeURIComponent(product.id)}" class="view-product-btn">
                            View Product
                        </a>
                        <button 
                            type="button" 
                            class="cart-icon-btn add-to-cart-quick" 
                            data-id="${product.id}" 
                            title="Add to Shopping Bag"
                        >
                            🛍️
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Try-on button handler
        const tryBtn = card.querySelector(".try-product-btn");
        tryBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            try {
                sessionStorage.setItem("vesti_selected_product", JSON.stringify(product));
            } catch (err) {
                console.warn("Could not cache product to sessionStorage:", err);
            }
            window.location.href = `tryon.html?id=${encodeURIComponent(product.id)}`;
        });

        // Quick add to cart handler
        const cartBtn = card.querySelector(".add-to-cart-quick");
        cartBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            await quickAddToCart(product, cartBtn);
        });

        featuredGrid.appendChild(card);
    });
}

// =====================================================
// RESET FILTERS
// =====================================================
function resetFilters() {
    activeCategoryFilter = "all";
    currentSearchQuery = "";
    if (productSearchInput) productSearchInput.value = "";

    // Reset filter pill active state
    if (categoryFilterBar) {
        categoryFilterBar.querySelectorAll(".filter-pill").forEach(p => {
            p.classList.toggle("active", p.dataset.filter === "all");
        });
    }

    filterAndRenderProducts();
}

// =====================================================
// QUICK ADD TO CART
// =====================================================
async function quickAddToCart(product, btn) {
    const user = auth.currentUser;
    if (!user) {
        if (window.showToast) {
            window.showToast("Please log in to add items to your shopping bag.", "error");
        } else {
            alert("Please log in to add items to your shopping bag.");
        }
        setTimeout(() => {
            window.location.href = `login.html?redirect=home.html`;
        }, 1200);
        return;
    }

    try {
        btn.textContent = "⏳";
        const itemRef = doc(db, "carts", user.uid, "items", product.id);
        const existing = await getDoc(itemRef);
        let qty = 1;

        if (existing.exists()) {
            qty = (Number(existing.data().quantity) || 1) + 1;
        }

        await setDoc(itemRef, {
            productId: product.id,
            name: product.name,
            category: product.category || "Dresses",
            price: Number(product.price) || 1999,
            image: product.image || "",
            quantity: qty
        });

        btn.textContent = "✓";
        if (window.showToast) {
            window.showToast(`${product.name} added to cart! 🛍️`);
        }

        setTimeout(() => {
            btn.textContent = "🛍️";
        }, 1500);
    } catch (err) {
        console.error("Failed to add to cart:", err);
        btn.textContent = "🛍️";
        if (window.showToast) window.showToast("Could not add to cart.", "error");
    }
}

// =====================================================
// SETUP EVENT LISTENERS (Search, Pills, Categories)
// =====================================================
function setupSearchAndFilters() {
    // 1. Live Search Input
    if (productSearchInput) {
        productSearchInput.addEventListener("input", (e) => {
            currentSearchQuery = e.target.value.trim();
            filterAndRenderProducts();
        });

        productSearchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                // Smooth scroll to products section
                const target = document.getElementById("products");
                if (target) target.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // 2. Clear Search Button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            if (productSearchInput) productSearchInput.value = "";
            currentSearchQuery = "";
            filterAndRenderProducts();
            if (productSearchInput) productSearchInput.focus();
        });
    }

    // 3. Category Filter Pills in Collection Section
    if (categoryFilterBar) {
        categoryFilterBar.querySelectorAll(".filter-pill").forEach(pill => {
            pill.addEventListener("click", () => {
                categoryFilterBar.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
                pill.classList.add("active");
                activeCategoryFilter = pill.dataset.filter || "all";
                filterAndRenderProducts();
            });
        });
    }

    // 4. Shop By Category Cards
    document.querySelectorAll(".category-card[data-category]").forEach(card => {
        const handleCategoryClick = () => {
            const cat = card.dataset.category;
            if (!cat) return;

            activeCategoryFilter = cat;

            // Update active state in pills bar
            if (categoryFilterBar) {
                categoryFilterBar.querySelectorAll(".filter-pill").forEach(p => {
                    p.classList.toggle("active", p.dataset.filter?.toLowerCase() === cat.toLowerCase());
                });
            }

            filterAndRenderProducts();

            // Smooth scroll to products section
            const target = document.getElementById("products");
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        };

        card.addEventListener("click", handleCategoryClick);
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCategoryClick();
            }
        });
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    setupSearchAndFilters();
});

// Run load immediately
setupSearchAndFilters();
loadProducts();
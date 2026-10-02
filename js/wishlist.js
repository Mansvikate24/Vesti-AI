// ==========================================================================
// VESTI-AI - WISHLIST MANAGEMENT
// Loads and displays saved dresses, synchronizes removals, and links to try-on.
// ==========================================================================

import { fallbackProducts } from "./products.js";

export function initWishlist() {
    const grid = document.getElementById("wishlistGrid");
    const emptyState = document.getElementById("wishlistEmptyState");
    const countBadge = document.getElementById("wishlistCountBadge");

    if (!grid || !emptyState) return;

    function renderWishlist() {
        const wishlist = JSON.parse(localStorage.getItem("vestiai_wishlist") || "[]");
        
        if (countBadge) {
            countBadge.textContent = `${wishlist.length} Saved ${wishlist.length === 1 ? 'Item' : 'Items'}`;
        }

        if (wishlist.length === 0) {
            grid.style.display = "none";
            emptyState.style.display = "block";
            return;
        }

        grid.style.display = "grid";
        emptyState.style.display = "none";

        // Find saved items from product catalog
        const items = fallbackProducts.filter(p => wishlist.includes(p.id));

        if (items.length === 0) {
            grid.style.display = "none";
            emptyState.style.display = "block";
            return;
        }

        let html = "";
        items.forEach(p => {
            html += `
                <div class="product-card">
                    <div class="product-card-badge">${p.badge || 'Saved'}</div>
                    <button type="button" class="wishlist-btn active" onclick="removeFromWishlist('${p.id}', event)" title="Remove from Wishlist">
                        ❤️
                    </button>
                    <div class="product-image-wrap">
                        <img src="${p.image}" alt="${p.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <span class="product-category">${p.category}</span>
                        <h3 class="product-title">${p.name}</h3>
                        <div class="product-price-row">
                            <span class="product-price">₹${p.price.toLocaleString("en-IN")}</span>
                            ${p.originalPrice ? `<span class="product-orig-price">₹${p.originalPrice.toLocaleString("en-IN")}</span>` : ''}
                        </div>
                        <div style="font-size: 0.8rem; color: #8f8ba3; margin-bottom: 12px;">
                            Sizes: XS, S, M, L, XL
                        </div>
                        <div class="product-actions">
                            <a href="tryon.html?id=${p.id}" class="primary-btn" style="flex: 1; padding: 10px; font-size: 0.88rem; text-align: center;">
                                ✨ Try On
                            </a>
                            <a href="product.html?id=${p.id}" class="secondary-btn" style="padding: 10px 14px; font-size: 0.88rem;" title="View Product Details">
                                Details
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    window.removeFromWishlist = function(id, e) {
        if (e) e.stopPropagation();
        let wishlist = JSON.parse(localStorage.getItem("vestiai_wishlist") || "[]");
        wishlist = wishlist.filter(item => item !== id);
        localStorage.setItem("vestiai_wishlist", JSON.stringify(wishlist));
        if (window.showToast) window.showToast("Removed from Wishlist 🤍");
        renderWishlist();
    };

    renderWishlist();
}

// Auto-run when DOM ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWishlist);
} else {
    initWishlist();
}

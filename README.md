# 👗 Vesti-AI — AI-Powered Virtual Dressing Room

> **"Try Virtually. Shop Confidently."**  
> *Alternative Tagline: "Your Perfect Fit, Powered by AI."*

---

## 🌟 Executive Summary

**Vesti-AI** is a modern fashion technology startup platform and entrepreneurship prototype designed to revolutionize online and in-store dress shopping. By combining client-side computer vision (**Google MediaPipe Pose**) with a responsive, luxury fashion-tech e-commerce experience (**Firebase Firestore & Auth**), Vesti-AI enables customers to preview digital garments aligned with their silhouette directly inside a web browser without recording or harvesting raw camera video on remote servers.

---

## 🎨 1. Brand Identity & Visual Language

### Brand Color Palette
| Color Role | Hex Code | HSL / Usage |
| :--- | :--- | :--- |
| **Midnight Black** | `#111018` | Deep luxury dark surfaces, hero backdrops, typography |
| **Elegant Purple** | `#7657FF` | Primary brand accent, primary CTA buttons, active state highlights |
| **Electric Lavender** | `#B9A7FF` | Secondary glow, tag badges, card borders, subtle accents |
| **Soft White** | `#FAF9FF` | Primary light background, canvas surface, crisp typography |
| **Light Gray** | `#EAE8F2` | Subtle structural borders, card separation, dividers |
| **Accent Pink** | `#FF77B7` | High-impact promotional tags, sparkle nodes, notification badges |

### Brand Typography
- **Headings:** *Playfair Display* (Editorial luxury and elegance)
- **Body & Interactive Controls:** *Outfit* / Sans-Serif (Modern, highly readable, geometric fashion-tech)

### Logo Variations Created
- `assets/logo/vesti-ai-logo.svg`: Full logo with dress silhouette, AI neural nodes, and glowing wordmark.
- `assets/logo/vesti-ai-icon.svg`: Minimal icon squircle for website favicon, mobile app icons, and social avatars.
- `assets/logo/vesti-ai-logo-light.svg`: High-contrast version for light backdrops.
- `assets/logo/vesti-ai-logo-mono.svg`: Monochrome single-color version.

---

## 📂 2. Project Directory Structure

```
vesti-ai/
│
├── index.html                   # Flagship Home Page (Announcement, Hero, Benefits, Timeline, Privacy)
├── shop.html                    # Dresses-only Catalog (Search, Category/Color/Price Filters, Sorting)
├── product.html                 # Canonical Product Record (Sizes, Color, Try-On, Wishlist, Cart)
├── tryon.html                   # Virtual Dressing Room Studio (2-Panel Pose AI Fitting Stage)
├── scanner.html                 # Boutique QR Tag Scanner & Product ID Validation
├── wishlist.html                # Saved Dresses & Quick Try-On Routing
├── cart.html                    # Shopping Bag with Quantity, Subtotal, and Price Validation
├── checkout.html                # Secure Checkout (COD + Simulated UPI Payment Flow)
├── orders.html                  # Purchase History and Order Tracking
├── profile.html                 # User Account Management & Session Controls
├── login.html                   # Customer Authentication Portal
├── register.html                # New User Registration
├── admin.html                   # Inventory Dashboard (Catalog Seeding, Stock, QR Management)
├── business.html                # Business Model, Value Proposition, Pricing & Economics
├── technology.html              # 6-Layer Architecture Transparency & Audit Status Table
├── about.html                   # Startup Story, Vision, Mission, Values & Founder Bio
├── contact.html                 # Partnership & Technical Feedback Inquiries
├── privacy.html                 # Camera Security, Local Processing & Data Deletion Policy
├── terms.html                   # Virtual Try-On Visual Preview Disclaimers & Fair Use Terms
│
├── css/
│   ├── global.css               # Shared luxury fashion-tech design tokens and layout styles
│   └── color-guide.css          # Color theory palettes and swatch cards
│
├── js/
│   ├── app.js                   # Navigation menus, toast system, global event listeners
│   ├── auth-guard.js            # Route protection separating public and protected pages
│   ├── auth.js                  # Firebase email/password registration & login logic
│   ├── products.js              # Curated dress catalog, dress-only filters & search engine
│   ├── tryon.js                 # MediaPipe Pose tracking, canvas overlay, tailor sliders
│   ├── qr-scanner.js            # Live camera QR tag parser & product validator
│   ├── business-calculator.js   # Interactive unit economics & pro-forma monthly calculator
│   ├── wishlist.js              # Local & Firestore wishlist persistence
│   ├── cart.js                  # Shopping bag operations and stock checks
│   ├── checkout.js              # Order submission and simulated UPI payment handler
│   ├── orders.js                # Customer order history retrieval
│   └── product-details.js       # Product details loader, size selector & cart handler
│
├── firebase/
│   └── firebase-config.js       # Modular Firebase App, Auth, and Firestore initialization
│
├── assets/
│   ├── logo/                    # Vector SVG logo files and favicon
│   └── product/                 # High-resolution transparent garment assets & dress images
│
├── firestore.rules              # Role-based Firestore security rules
├── .gitignore                   # Version control exclusion rules
└── README.md                    # Complete startup documentation and guide
```

---

## 🏛️ 3. Six-Layer Technology Transparency Architecture

Vesti-AI provides explicit technological honesty regarding what is currently implemented vs. what requires future research:

| Layer | Technologies | Current Implementation Status | Limitations & Notes |
| :--- | :--- | :--- | :--- |
| **Layer 1: User Interface** | HTML5, CSS3, ES6+ | **Implemented and Tested** | Modern browser required; vanilla architecture with no heavy framework dependencies. |
| **Layer 2: Auth & Database** | Firebase Auth, Firestore | **Implemented and Tested** | Real-time session tokens and secure user document isolation. |
| **Layer 3: Camera & AI** | MediaPipe Pose, Canvas API | **Implemented and Tested** | 2D torso landmark tracking; requires adequate ambient room lighting. |
| **Layer 4: QR Tag System** | In-Browser Scanner API | **Implemented and Tested** | Physical QR hangtags validated against Firestore product IDs. |
| **Layer 5: E-Commerce** | Cart, Wishlist, COD, UPI Sim | **Implemented and Tested** | Transparent simulated payment flow; does not deduct real money. |
| **Layer 6: Security & Cloud** | HTTPS, Firestore Rules | **Implemented and Tested** | Video frames processed locally; client credentials strictly sanitized. |

### ⚠️ Critical Engineering Distinction: 2D Overlay vs. 3D Cloth Physics
- **What Vesti-AI Currently Delivers:** Real-time 2D planar alignment of transparent garments scaled to shoulder (landmarks 11, 12) and hip (landmarks 23, 24) distances with user-controlled Tailor Fit sliders (scale, vertical offset, and opacity).
- **What 3D Simulation Requires (Future Roadmap):** Dense volumetric mesh estimation (e.g. SMPL models), finite element cloth physical deformation, and cloud GPU cluster pipelines. Vesti-AI never falsely claims to offer bespoke physical tailoring guarantees.

---

## 💼 4. Business Model & Unit Economics

### Proposed Revenue Channels
1. **Direct Dress E-Commerce:** 25%–35% gross retail margin on curated dresses sold via the storefront.
2. **B2B Boutique SaaS Subscriptions:**
   - *Starter Retailer Plan:* ₹999 / month (up to 15 dresses, 500 try-on sessions).
   - *Growth Retailer Plan:* ₹2,999 / month (up to 75 dresses, 3,000 sessions, analytics).
   - *Enterprise Brand Plan:* Custom tiered pricing for multi-store chains and smart-mirror kiosks.
3. **Embeddable B2B Technology Licensing:** Modular SDK licensing for external fashion e-commerce sites.
4. **White-Label Solutions:** Customized dressing room portals for department stores.

### Interactive Unit Economics Calculator (`business.html` + `js/business-calculator.js`)
Users can dynamically adjust:
- Number of paying boutique retailers
- Monthly SaaS subscription price
- Direct dresses sold per month
- Average Selling Price (ASP)
- Gross margin percentage
- Cloud, marketing, and operational expenses
The calculator reacts in real-time to compute gross merchant volume (GMV), subscription revenue, operational expenses, and net profit/loss.

---

## 🔒 5. Firestore Database Structure & Security Rules

### Firestore Product Document Schema
```json
{
  "name": "Crimson Royal Silhouette",
  "category": "Evening Gowns",
  "price": 2899,
  "originalPrice": 5799,
  "discount": "50% OFF",
  "description": "Vibrant crimson silk maxi dress with flowing drape and comfortable stretch lining.",
  "image": "assets/product/reddress.png",
  "tryOnAssetUrl": "assets/product/reddress.png",
  "availableSizes": ["XS", "S", "M", "L", "XL"],
  "colors": ["Crimson"],
  "stock": 20,
  "qrCode": "crimson-dress-02",
  "isActive": true,
  "createdAt": "2026-10-02T12:00:00Z"
}
```

### Security Rules Summary (`firestore.rules`)
- `products`: Public read access for customers; create, update, and delete operations restricted to verified administrators.
- `users`: Users can read and write only their own account document.
- `carts` & `wishlists`: Private subcollections strictly readable and writeable by the authenticated owner (`request.auth.uid == userId`).
- `orders`: Users can create orders and read their own history; status updates restricted to administrators.

---

## 🚀 6. Setup & Local Development Instructions

### Prerequisites
- Modern web browser (Chrome, Edge, Firefox, Safari) with webcam support.
- Local static HTTP server (e.g. VS Code Live Server, Python HTTP server, or Node `http-server`).

### Running Locally
1. Open terminal inside the project directory:
   ```powershell
   # Using Python 3 built-in HTTP server
   python -m http.server 5500
   ```
   *or using Node:*
   ```powershell
   npx serve -l 5500
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:5500/index.html
   ```

### Camera Access Requirements
- Modern browsers permit camera access via `getUserMedia()` exclusively on `localhost` or over secure `https://` origins. When deploying to production (e.g. Firebase Hosting or GitHub Pages), ensure HTTPS is enabled.

---

## ✅ 7. Demonstration Verification Checklist

During investor presentations or academic project evaluation, verify:
- [x] **Website Navigation:** Seamless transition across Home, Shop, Try-On, Business, Technology, About, and Contact.
- [x] **Mobile Responsiveness:** Clean hamburger menu, flexible product grids, and responsive camera viewport.
- [x] **Camera Permission Prompt:** Explicit opt-in when clicking "Start Camera"; clean error handling if denied.
- [x] **Live Pose Detection:** Real-time tracking of shoulder and torso landmarks using MediaPipe.
- [x] **Tailor Fit Sliders:** Real-time scaling (0.75x–2.4x), vertical offset adjustments, and opacity control.
- [x] **Fallback Demo Mode:** "Try Demo Model" and local photo upload for environments without webcams.
- [x] **Dresses-Only Catalog:** Curated dresses with search, category filters, price slider, and sorting.
- [x] **Boutique QR Scanner:** Live camera decoding + demonstration QR hangtag buttons linking directly to try-on.
- [x] **Wishlist Management:** Heart icon save/removal with instant count updates.
- [x] **Shopping Bag & Checkout:** Cart totals calculation, COD selection, and simulated UPI flow.
- [x] **Business Calculator:** Real-time pro-forma unit economics computation in INR.
- [x] **Technology Transparency:** Clear distinction between implemented capabilities and future research.

---

## 📜 License & Disclaimers

Developed as an academic entrepreneurship project and fashion technology prototype. All virtual try-on previews represent visual guides rather than exact tailoring guarantees.

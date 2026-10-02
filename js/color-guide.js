// ==========================================================================
// VestiAI - Interactive Color Guide & Color Theory Studio Controller
// ==========================================================================

import {
    skinTonesData,
    undertonesData,
    undertoneQuizQuestions,
    getRecommendations,
    colorTheoryPillars
} from "./color-guide-data.js";

class ColorGuideStudio {
    constructor() {
        this.currentStep = 1;
        this.selectedSkinTone = "medium"; // default to warm wheatish/medium
        this.selectedUndertone = "warm";
        this.selectedCategory = "all";
        this.selectedColor = null;
        this.currentSilhouette = "gown"; // 'gown' | 'slip' | 'aline'
        this.paletteData = null;

        // Quiz State
        this.quizAnswers = {};
        this.currentQuizQuestionIndex = 0;

        // Color Theory Harmony Active State
        this.activeHarmony = "complementary";

        this.init();
    }

    init() {
        console.log("Initializing VestiAI Color Guide & Theory Studio...");
        this.renderSkinToneCards();
        this.renderUndertoneCards();
        this.renderColorTheorySection();
        this.setupEventListeners();
        this.updateStepView(1);
    }

    // ==========================================================================
    // STEP 1: SKIN TONE SELECTION
    // ==========================================================================
    renderSkinToneCards() {
        const grid = document.getElementById("skinToneGrid");
        if (!grid) return;

        grid.innerHTML = skinTonesData.map((tone) => {
            const isSelected = tone.id === this.selectedSkinTone;
            return `
                <div 
                    class="skin-tone-card ${isSelected ? "selected" : ""}" 
                    data-tone-id="${tone.id}"
                    role="button"
                    tabindex="0"
                    aria-pressed="${isSelected}"
                    aria-label="Select skin tone depth: ${tone.name}"
                >
                    <div class="tone-swatch-wrapper">
                        <span class="tone-swatch" style="background-color: ${tone.hex};"></span>
                        ${isSelected ? '<span class="selected-badge">✓</span>' : ""}
                    </div>
                    <div class="tone-info">
                        <h4 class="tone-name">${tone.name}</h4>
                        <span class="tone-category-tag">${tone.toneCategory}</span>
                        <p class="tone-desc">${tone.description}</p>
                    </div>
                </div>
            `;
        }).join("");

        // Attach clicks
        grid.querySelectorAll(".skin-tone-card").forEach((card) => {
            const handleSelect = () => {
                const toneId = card.getAttribute("data-tone-id");
                this.selectSkinTone(toneId);
            };

            card.addEventListener("click", handleSelect);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect();
                }
            });
        });
    }

    selectSkinTone(toneId) {
        this.selectedSkinTone = toneId;
        const grid = document.getElementById("skinToneGrid");
        if (grid) {
            grid.querySelectorAll(".skin-tone-card").forEach((c) => {
                const match = c.getAttribute("data-tone-id") === toneId;
                c.classList.toggle("selected", match);
                c.setAttribute("aria-pressed", match);
                const badgeWrapper = c.querySelector(".tone-swatch-wrapper");
                const existingBadge = badgeWrapper.querySelector(".selected-badge");
                if (match && !existingBadge) {
                    badgeWrapper.insertAdjacentHTML("beforeend", '<span class="selected-badge">✓</span>');
                } else if (!match && existingBadge) {
                    existingBadge.remove();
                }
            });
        }

        // Enable and highlight Continue to Step 2
        const nextBtn = document.getElementById("step1NextBtn");
        if (nextBtn) {
            nextBtn.removeAttribute("disabled");
            nextBtn.classList.add("pulse-cta");
        }

        // Live update model preview if already initialized
        this.updateModelSkinTone();
    }

    // ==========================================================================
    // STEP 2: UNDERTONE SELECTION
    // ==========================================================================
    renderUndertoneCards() {
        const grid = document.getElementById("undertoneGrid");
        if (!grid) return;

        grid.innerHTML = undertonesData.map((u) => {
            const isSelected = u.id === this.selectedUndertone;
            const isQuiz = u.isQuizTrigger;
            return `
                <div 
                    class="undertone-card ${isSelected ? "selected" : ""} ${isQuiz ? "quiz-card" : ""}" 
                    data-undertone-id="${u.id}"
                    role="button"
                    tabindex="0"
                    aria-pressed="${isSelected}"
                    aria-label="${isQuiz ? "Take quiz to find undertone" : `Select undertone: ${u.name}`}"
                >
                    <div class="undertone-card-header">
                        <span class="undertone-icon">${u.icon}</span>
                        <span class="undertone-badge">${u.badge}</span>
                    </div>
                    <h4 class="undertone-name">${u.name}</h4>
                    <p class="undertone-summary">${u.summary}</p>
                    
                    ${!isQuiz ? `
                        <ul class="undertone-traits-list">
                            <li><strong>Veins:</strong> ${u.veinTrait}</li>
                            <li><strong>Jewelry:</strong> ${u.jewelryTrait}</li>
                            <li><strong>Sunlight:</strong> ${u.sunTrait}</li>
                        </ul>
                    ` : `
                        <div class="quiz-prompt-btn">
                            <span>Launch 60s Quiz →</span>
                        </div>
                    `}
                </div>
            `;
        }).join("");

        // Attach clicks
        grid.querySelectorAll(".undertone-card").forEach((card) => {
            const handleSelect = () => {
                const undertoneId = card.getAttribute("data-undertone-id");
                if (undertoneId === "not-sure") {
                    this.openQuizModal();
                } else {
                    this.selectUndertone(undertoneId);
                }
            };

            card.addEventListener("click", handleSelect);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect();
                }
            });
        });
    }

    selectUndertone(undertoneId) {
        this.selectedUndertone = undertoneId;
        const grid = document.getElementById("undertoneGrid");
        if (grid) {
            grid.querySelectorAll(".undertone-card").forEach((c) => {
                const match = c.getAttribute("data-undertone-id") === undertoneId;
                c.classList.toggle("selected", match);
                c.setAttribute("aria-pressed", match);
            });
        }

        const nextBtn = document.getElementById("step2NextBtn");
        if (nextBtn) {
            nextBtn.removeAttribute("disabled");
            nextBtn.classList.add("pulse-cta");
        }
    }

    // ==========================================================================
    // STEP NAVIGATION CONTROLLER
    // ==========================================================================
    updateStepView(stepNumber) {
        this.currentStep = stepNumber;

        // Update progress badges
        const step1Badge = document.getElementById("stepIndicator1");
        const step2Badge = document.getElementById("stepIndicator2");
        const step3Badge = document.getElementById("stepIndicator3");
        const stepText = document.getElementById("stepProgressText");

        if (step1Badge) step1Badge.className = `step-indicator-item ${stepNumber === 1 ? "active" : stepNumber > 1 ? "completed" : ""}`;
        if (step2Badge) step2Badge.className = `step-indicator-item ${stepNumber === 2 ? "active" : stepNumber > 2 ? "completed" : ""}`;
        if (step3Badge) step3Badge.className = `step-indicator-item ${stepNumber === 3 ? "active" : ""}`;

        if (stepText) {
            if (stepNumber === 1) stepText.textContent = "Step 1 of 3 — Select Skin Tone Depth";
            else if (stepNumber === 2) stepText.textContent = "Step 2 of 3 — Select Undertone";
            else stepText.textContent = "Step 3 of 3 — Your Personalized Color Palette & Studio Preview";
        }

        // Toggle sections
        const step1Sec = document.getElementById("colorGuideStep1");
        const step2Sec = document.getElementById("colorGuideStep2");
        const step3Sec = document.getElementById("colorGuideStep3");

        if (step1Sec) step1Sec.style.display = stepNumber === 1 ? "block" : "none";
        if (step2Sec) step2Sec.style.display = stepNumber === 2 ? "block" : "none";
        if (step3Sec) step3Sec.style.display = stepNumber === 3 ? "block" : "none";

        if (stepNumber === 3) {
            this.generatePaletteResults();
        }

        // Smooth scroll to guide section top on step change if needed
        const sectionTop = document.getElementById("color-guide");
        if (sectionTop && stepNumber > 1) {
            sectionTop.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    // ==========================================================================
    // STEP 3: PALETTE GENERATION & DRESS PREVIEW
    // ==========================================================================
    generatePaletteResults() {
        const tone = skinTonesData.find(t => t.id === this.selectedSkinTone) || skinTonesData[4];
        const undertone = undertonesData.find(u => u.id === this.selectedUndertone) || undertonesData[0];

        // Update Summary Chips in Step 3
        const toneChip = document.getElementById("activeToneChip");
        const undertoneChip = document.getElementById("activeUndertoneChip");
        const depthAdviceEl = document.getElementById("paletteDepthAdvice");

        if (toneChip) {
            toneChip.innerHTML = `<span class="chip-swatch" style="background:${tone.hex}"></span> ${tone.name}`;
        }
        if (undertoneChip) {
            undertoneChip.innerHTML = `${undertone.icon} ${undertone.name} Undertone`;
        }

        this.paletteData = getRecommendations(this.selectedSkinTone, this.selectedUndertone);

        if (depthAdviceEl && this.paletteData.depthAdvice) {
            depthAdviceEl.textContent = this.paletteData.depthAdvice;
        }

        // Default to first Best Match color
        const firstBestMatch = this.paletteData.bestMatches[0] || this.paletteData.boldVibrant[0];
        this.selectColor(firstBestMatch);

        // Render color categories and swatches
        this.renderSwatches();
        this.updateModelSkinTone();
    }

    renderSwatches() {
        const container = document.getElementById("paletteSwatchesGrid");
        if (!container || !this.paletteData) return;

        let colorsToDisplay = [];
        if (this.selectedCategory === "all") {
            colorsToDisplay = [
                ...this.paletteData.bestMatches.map(c => ({ ...c, categoryName: "Best Matches" })),
                ...this.paletteData.softElegant.map(c => ({ ...c, categoryName: "Soft & Elegant" })),
                ...this.paletteData.boldVibrant.map(c => ({ ...c, categoryName: "Bold & Vibrant" })),
                ...this.paletteData.classicNeutrals.map(c => ({ ...c, categoryName: "Classic Neutrals" })),
                ...this.paletteData.tryTheseToo.map(c => ({ ...c, categoryName: "Try These Too" }))
            ];
        } else if (this.selectedCategory === "bestMatches") {
            colorsToDisplay = this.paletteData.bestMatches.map(c => ({ ...c, categoryName: "Best Matches" }));
        } else if (this.selectedCategory === "softElegant") {
            colorsToDisplay = this.paletteData.softElegant.map(c => ({ ...c, categoryName: "Soft & Elegant" }));
        } else if (this.selectedCategory === "boldVibrant") {
            colorsToDisplay = this.paletteData.boldVibrant.map(c => ({ ...c, categoryName: "Bold & Vibrant" }));
        } else if (this.selectedCategory === "classicNeutrals") {
            colorsToDisplay = this.paletteData.classicNeutrals.map(c => ({ ...c, categoryName: "Classic Neutrals" }));
        } else if (this.selectedCategory === "tryTheseToo") {
            colorsToDisplay = this.paletteData.tryTheseToo.map(c => ({ ...c, categoryName: "Try These Too" }));
        }

        container.innerHTML = colorsToDisplay.map((color) => {
            const isSelected = this.selectedColor && this.selectedColor.hex === color.hex;
            return `
                <div 
                    class="color-swatch-card ${isSelected ? "active" : ""}" 
                    data-hex="${color.hex}"
                    role="button"
                    tabindex="0"
                    aria-label="Preview dress in ${color.name}"
                    aria-pressed="${isSelected}"
                >
                    <div class="swatch-circle-box" style="background-color: ${color.hex}; border-color: ${color.hex === '#FFFFFF' ? '#e2e8f0' : color.hex};">
                        ${isSelected ? '<span class="swatch-check" style="color: ' + color.textColor + '">✓</span>' : ""}
                    </div>
                    <div class="swatch-label-wrap">
                        <span class="swatch-name">${color.name}</span>
                        <span class="swatch-hex">${color.hex}</span>
                        <span class="swatch-cat-badge">${color.categoryName || color.contrast}</span>
                    </div>
                </div>
            `;
        }).join("");

        // Attach swatch clicks
        container.querySelectorAll(".color-swatch-card").forEach((card) => {
            const handleSelect = () => {
                const hex = card.getAttribute("data-hex");
                const foundColor = colorsToDisplay.find(c => c.hex === hex);
                if (foundColor) {
                    this.selectColor(foundColor);
                }
            };

            card.addEventListener("click", handleSelect);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect();
                }
            });
        });
    }

    selectColor(colorObj) {
        if (!colorObj) return;
        this.selectedColor = colorObj;

        // Update active class on swatches
        const container = document.getElementById("paletteSwatchesGrid");
        if (container) {
            container.querySelectorAll(".color-swatch-card").forEach((card) => {
                const match = card.getAttribute("data-hex") === colorObj.hex;
                card.classList.toggle("active", match);
                card.setAttribute("aria-pressed", match);
                const circleBox = card.querySelector(".swatch-circle-box");
                const check = circleBox.querySelector(".swatch-check");
                if (match && !check) {
                    circleBox.insertAdjacentHTML("beforeend", `<span class="swatch-check" style="color: ${colorObj.textColor}">✓</span>`);
                } else if (!match && check) {
                    check.remove();
                }
            });
        }

        // Update Dress Silhouette Fill
        this.updateDressPreview(colorObj);

        // Update "Why it Works" card
        const titleEl = document.getElementById("previewColorTitle");
        const hexEl = document.getElementById("previewColorHex");
        const contrastEl = document.getElementById("previewColorContrast");
        const whyEl = document.getElementById("previewColorWhy");
        const tagEl = document.getElementById("previewColorTag");

        if (titleEl) titleEl.textContent = colorObj.name;
        if (hexEl) hexEl.textContent = colorObj.hex;
        if (contrastEl) contrastEl.textContent = colorObj.contrast || "Harmonious";
        if (whyEl) whyEl.textContent = colorObj.why;
        if (tagEl) {
            tagEl.style.backgroundColor = colorObj.hex;
            tagEl.style.color = colorObj.textColor;
        }

        // Bridge: Update the button label to filter catalog
        const filterBtn = document.getElementById("filterCatalogByColorBtn");
        if (filterBtn) {
            filterBtn.textContent = `Shop ${colorObj.name} Dresses in Collection ↓`;
        }
    }

    updateModelSkinTone() {
        const tone = skinTonesData.find(t => t.id === this.selectedSkinTone) || skinTonesData[4];
        const skinElements = document.querySelectorAll(".model-skin-fill");
        skinElements.forEach((el) => {
            el.setAttribute("fill", tone.hex);
            el.style.fill = tone.hex;
        });

        // Also update highlight tone
        const skinShades = document.querySelectorAll(".model-skin-shade");
        skinShades.forEach((el) => {
            el.setAttribute("fill", this.adjustColor(tone.hex, -25));
            el.style.fill = this.adjustColor(tone.hex, -25);
        });
    }

    updateDressPreview(colorObj) {
        const dressElements = document.querySelectorAll(".model-dress-fill");
        dressElements.forEach((el) => {
            el.style.transition = "fill 0.45s cubic-bezier(0.4, 0, 0.2, 1)";
            el.setAttribute("fill", colorObj.hex);
            el.style.fill = colorObj.hex;
        });

        // Update dress shadows/highlights for realism
        const dressShadows = document.querySelectorAll(".model-dress-shadow");
        dressShadows.forEach((el) => {
            el.style.transition = "fill 0.45s ease";
            el.setAttribute("fill", this.adjustColor(colorObj.hex, -35));
            el.style.fill = this.adjustColor(colorObj.hex, -35);
        });

        const dressHighlights = document.querySelectorAll(".model-dress-highlight");
        dressHighlights.forEach((el) => {
            el.style.transition = "fill 0.45s ease";
            el.setAttribute("fill", this.adjustColor(colorObj.hex, 25));
            el.style.fill = this.adjustColor(colorObj.hex, 25);
        });

        // Visual backdrop aura
        const auraEl = document.getElementById("previewModelAura");
        if (auraEl) {
            auraEl.style.background = `radial-gradient(circle, ${colorObj.hex}40 0%, transparent 70%)`;
        }
    }

    adjustColor(hex, percent) {
        // Safe hex color lightener/darkener
        let num = parseInt(hex.replace("#", ""), 16);
        let amt = Math.round(2.55 * percent);
        let R = (num >> 16) + amt;
        let G = (num >> 8 & 0x00FF) + amt;
        let B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    setSilhouette(silhouette) {
        this.currentSilhouette = silhouette;
        const gown = document.getElementById("silhouetteGown");
        const slip = document.getElementById("silhouetteSlip");
        const aline = document.getElementById("silhouetteAline");

        if (gown) gown.style.display = silhouette === "gown" ? "block" : "none";
        if (slip) slip.style.display = silhouette === "slip" ? "block" : "none";
        if (aline) aline.style.display = silhouette === "aline" ? "block" : "none";

        // Update active tab buttons
        document.querySelectorAll(".silhouette-pill").forEach((btn) => {
            const match = btn.getAttribute("data-silhouette") === silhouette;
            btn.classList.toggle("active", match);
            btn.setAttribute("aria-pressed", match);
        });

        if (this.selectedColor) {
            this.updateDressPreview(this.selectedColor);
        }
    }

    // ==========================================================================
    // NOT SURE? UNDERTONE QUIZ MODAL
    // ==========================================================================
    openQuizModal() {
        this.quizAnswers = {};
        this.currentQuizQuestionIndex = 0;
        const modal = document.getElementById("undertoneQuizModal");
        if (!modal) return;

        modal.classList.add("open");
        document.body.style.overflow = "hidden";
        this.renderQuizQuestion();
    }

    closeQuizModal() {
        const modal = document.getElementById("undertoneQuizModal");
        if (!modal) return;
        modal.classList.remove("open");
        document.body.style.overflow = "";
    }

    renderQuizQuestion() {
        const container = document.getElementById("quizQuestionsContainer");
        const progressEl = document.getElementById("quizProgressNumber");
        const progressBar = document.getElementById("quizProgressBarFill");
        const resultCard = document.getElementById("quizResultCard");

        if (!container) return;

        if (this.currentQuizQuestionIndex >= undertoneQuizQuestions.length) {
            // All questions answered, compute result
            this.showQuizResult();
            return;
        }

        if (resultCard) resultCard.style.display = "none";
        container.style.display = "block";

        const q = undertoneQuizQuestions[this.currentQuizQuestionIndex];
        const stepNum = this.currentQuizQuestionIndex + 1;
        const total = undertoneQuizQuestions.length;

        if (progressEl) progressEl.textContent = `Question ${stepNum} of ${total}`;
        if (progressBar) progressBar.style.width = `${(stepNum / total) * 100}%`;

        container.innerHTML = `
            <div class="quiz-question-box">
                <h3 class="quiz-question-title">${q.title}</h3>
                <div class="quiz-options-grid">
                    ${q.options.map((opt, idx) => `
                        <button 
                            type="button" 
                            class="quiz-option-btn" 
                            data-undertone="${opt.undertone}"
                            data-index="${idx}"
                        >
                            <span class="quiz-opt-icon">${opt.icon}</span>
                            <span class="quiz-opt-label">${opt.label}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        `;

        container.querySelectorAll(".quiz-option-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const undertone = btn.getAttribute("data-undertone");
                this.quizAnswers[q.id] = undertone;
                this.currentQuizQuestionIndex++;
                this.renderQuizQuestion();
            });
        });
    }

    showQuizResult() {
        const container = document.getElementById("quizQuestionsContainer");
        const resultCard = document.getElementById("quizResultCard");
        const progressEl = document.getElementById("quizProgressNumber");
        const progressBar = document.getElementById("quizProgressBarFill");

        if (container) container.style.display = "none";
        if (resultCard) resultCard.style.display = "block";
        if (progressEl) progressEl.textContent = "Analysis Complete ✨";
        if (progressBar) progressBar.style.width = "100%";

        // Tally scores
        const counts = { warm: 0, cool: 0, neutral: 0, olive: 0 };
        Object.values(this.quizAnswers).forEach((tone) => {
            if (counts[tone] !== undefined) counts[tone]++;
        });

        // Find max
        let bestTone = "neutral";
        let maxCount = -1;
        for (const [t, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                bestTone = t;
            }
        }

        const toneMeta = undertonesData.find(u => u.id === bestTone) || undertonesData[2];

        const titleEl = document.getElementById("quizResultToneTitle");
        const descEl = document.getElementById("quizResultToneDesc");
        const iconEl = document.getElementById("quizResultToneIcon");

        if (titleEl) titleEl.textContent = `Your Likely Undertone: ${toneMeta.name}`;
        if (descEl) descEl.textContent = `${toneMeta.summary} ${toneMeta.veinTrait} ${toneMeta.jewelryTrait}`;
        if (iconEl) iconEl.textContent = toneMeta.icon;

        // Store result for direct apply
        this.suggestedQuizUndertone = bestTone;
    }

    applyQuizResult() {
        if (this.suggestedQuizUndertone) {
            this.selectUndertone(this.suggestedQuizUndertone);
            if (window.showToast) {
                window.showToast(`Applied ${this.suggestedQuizUndertone.toUpperCase()} undertone!`, "success");
            }
        }
        this.closeQuizModal();
        this.updateStepView(3);
    }

    // ==========================================================================
    // HELP GUIDE MODAL (Veins, Jewelry, Sun, White)
    // ==========================================================================
    openHelpGuideModal() {
        const modal = document.getElementById("undertoneHelpModal");
        if (!modal) return;
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    closeHelpGuideModal() {
        const modal = document.getElementById("undertoneHelpModal");
        if (!modal) return;
        modal.classList.remove("open");
        document.body.style.overflow = "";
    }

    // ==========================================================================
    // COLOR THEORY SECTION RENDERING & INTERACTIVE HARMONIES
    // ==========================================================================
    renderColorTheorySection() {
        const container = document.getElementById("colorTheoryPillarsContainer");
        if (!container) return;

        container.innerHTML = colorTheoryPillars.map((pillar) => {
            if (pillar.id === "color-wheel") {
                return `
                    <div class="theory-card interactive-wheel-card">
                        <div class="theory-card-header">
                            <span class="theory-icon">${pillar.icon}</span>
                            <div>
                                <h3 class="theory-card-title">${pillar.title}</h3>
                                <span class="theory-card-sub">${pillar.subtitle}</span>
                            </div>
                        </div>
                        <p class="theory-card-desc">${pillar.description}</p>
                        
                        <!-- Interactive Harmony Switcher -->
                        <div class="wheel-harmonies-selector">
                            <button type="button" class="harmony-btn active" data-harmony="complementary">Complementary</button>
                            <button type="button" class="harmony-btn" data-harmony="analogous">Analogous</button>
                            <button type="button" class="harmony-btn" data-harmony="monochromatic">Monochromatic</button>
                            <button type="button" class="harmony-btn" data-harmony="triadic">Triadic</button>
                        </div>

                        <!-- Live Visual Harmony Display -->
                        <div class="live-harmony-preview" id="liveHarmonyPreview">
                            <div class="harmony-swatches-row" id="harmonySwatchesRow">
                                <!-- Populated dynamically by updateHarmonyPreview -->
                            </div>
                            <p class="harmony-explanation" id="harmonyExplanationText"></p>
                        </div>
                    </div>
                `;
            }

            if (pillar.id === "hue-value-chroma") {
                return `
                    <div class="theory-card">
                        <div class="theory-card-header">
                            <span class="theory-icon">${pillar.icon}</span>
                            <div>
                                <h3 class="theory-card-title">${pillar.title}</h3>
                                <span class="theory-card-sub">${pillar.subtitle}</span>
                            </div>
                        </div>
                        <p class="theory-card-desc">${pillar.description}</p>
                        <div class="dimensions-grid">
                            ${pillar.points.map(pt => `
                                <div class="dimension-box">
                                    <h4>${pt.name}</h4>
                                    <p>${pt.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `;
            }

            if (pillar.id === "fabric-lighting") {
                return `
                    <div class="theory-card">
                        <div class="theory-card-header">
                            <span class="theory-icon">${pillar.icon}</span>
                            <div>
                                <h3 class="theory-card-title">${pillar.title}</h3>
                                <span class="theory-card-sub">${pillar.subtitle}</span>
                            </div>
                        </div>
                        <p class="theory-card-desc">${pillar.description}</p>
                        <div class="fabrics-grid">
                            ${pillar.fabrics.map(f => `
                                <div class="fabric-item">
                                    <strong>${f.name}</strong>
                                    <p>${f.effect}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `;
            }

            if (pillar.id === "contrast-dressing") {
                return `
                    <div class="theory-card">
                        <div class="theory-card-header">
                            <span class="theory-icon">${pillar.icon}</span>
                            <div>
                                <h3 class="theory-card-title">${pillar.title}</h3>
                                <span class="theory-card-sub">${pillar.subtitle}</span>
                            </div>
                        </div>
                        <p class="theory-card-desc">${pillar.description}</p>
                        <div class="contrast-rules-list">
                            ${pillar.contrastTypes.map(c => `
                                <div class="contrast-rule-item">
                                    <div class="rule-type-badge">${c.name}</div>
                                    <div class="rule-body">
                                        <p class="rule-def"><em>${c.definition}</em></p>
                                        <p class="rule-tip">✨ <strong>Styling Secret:</strong> ${c.stylingTip}</p>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `;
            }

            return "";
        }).join("");

        // Attach harmony switcher buttons
        container.querySelectorAll(".harmony-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const harm = btn.getAttribute("data-harmony");
                this.setHarmonyPreview(harm);
            });
        });

        // Initialize with complementary
        this.setHarmonyPreview("complementary");
    }

    setHarmonyPreview(harmonyKey) {
        this.activeHarmony = harmonyKey;
        const container = document.getElementById("colorTheoryPillarsContainer");
        if (container) {
            container.querySelectorAll(".harmony-btn").forEach((b) => {
                b.classList.toggle("active", b.getAttribute("data-harmony") === harmonyKey);
            });
        }

        const swatchesRow = document.getElementById("harmonySwatchesRow");
        const expText = document.getElementById("harmonyExplanationText");
        if (!swatchesRow || !expText) return;

        const harmoniesMap = {
            complementary: {
                colors: [
                    { name: "Emerald Pine", hex: "#0F5132" },
                    { name: "Ruby Sunset", hex: "#DC2626" }
                ],
                text: "Opposites on the wheel: High contrast, maximum visual impact, and red-carpet confidence."
            },
            analogous: {
                colors: [
                    { name: "Plum Noir", hex: "#4A154B" },
                    { name: "Mulberry", hex: "#8E2856" },
                    { name: "Dusty Rose", hex: "#C28285" }
                ],
                text: "Adjacent neighbors on the wheel: Serene, fluid, and effortlessly artistic luxury."
            },
            monochromatic: {
                colors: [
                    { name: "Ice Blue", hex: "#BFDBFE" },
                    { name: "Cobalt Blue", hex: "#2563EB" },
                    { name: "Midnight Navy", hex: "#0F172A" }
                ],
                text: "Varying values of a single hue: Elongates your vertical silhouette and looks chic."
            },
            triadic: {
                colors: [
                    { name: "Warm Amber", hex: "#D97706" },
                    { name: "Peacock Teal", hex: "#0D9488" },
                    { name: "Berry Violet", hex: "#9333EA" }
                ],
                text: "Equidistant triad: Dynamic color interplay that feels vibrant, balanced, and runway-inspired."
            }
        };

        const current = harmoniesMap[harmonyKey] || harmoniesMap.complementary;
        swatchesRow.innerHTML = current.colors.map(c => `
            <div class="harmony-chip">
                <span class="harmony-disc" style="background:${c.hex};"></span>
                <span class="harmony-chip-label">${c.name}</span>
            </div>
        `).join("");
        expText.textContent = current.text;
    }

    // ==========================================================================
    // EVENT LISTENERS & HOOKS
    // ==========================================================================
    setupEventListeners() {
        // Step Navigation Buttons
        const step1NextBtn = document.getElementById("step1NextBtn");
        const step2PrevBtn = document.getElementById("step2PrevBtn");
        const step2NextBtn = document.getElementById("step2NextBtn");
        const step3BackBtn = document.getElementById("step3BackBtn");
        const step3ResetBtn = document.getElementById("step3ResetBtn");

        if (step1NextBtn) step1NextBtn.addEventListener("click", () => this.updateStepView(2));
        if (step2PrevBtn) step2PrevBtn.addEventListener("click", () => this.updateStepView(1));
        if (step2NextBtn) step2NextBtn.addEventListener("click", () => this.updateStepView(3));
        if (step3BackBtn) step3BackBtn.addEventListener("click", () => this.updateStepView(2));
        if (step3ResetBtn) step3ResetBtn.addEventListener("click", () => this.updateStepView(1));

        // Step Indicator Pill Clicks (Direct jump if already unlocked)
        const step1Ind = document.getElementById("stepIndicator1");
        const step2Ind = document.getElementById("stepIndicator2");
        const step3Ind = document.getElementById("stepIndicator3");

        if (step1Ind) step1Ind.addEventListener("click", () => this.updateStepView(1));
        if (step2Ind) step2Ind.addEventListener("click", () => this.updateStepView(2));
        if (step3Ind) step3Ind.addEventListener("click", () => {
            if (this.selectedSkinTone && this.selectedUndertone) {
                this.updateStepView(3);
            }
        });

        // Category Filter Tabs in Step 3
        document.querySelectorAll(".palette-category-pill").forEach((btn) => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".palette-category-pill").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.selectedCategory = btn.getAttribute("data-category");
                this.renderSwatches();
            });
        });

        // Silhouette Selector Pills
        document.querySelectorAll(".silhouette-pill").forEach((btn) => {
            btn.addEventListener("click", () => {
                const sil = btn.getAttribute("data-silhouette");
                this.setSilhouette(sil);
            });
        });

        // Help Modal Triggers
        const openHelpBtn = document.getElementById("openUndertoneHelpBtn");
        const closeHelpBtn = document.getElementById("closeUndertoneHelpBtn");
        const closeHelpOverlay = document.getElementById("undertoneHelpModal");

        if (openHelpBtn) openHelpBtn.addEventListener("click", () => this.openHelpGuideModal());
        if (closeHelpBtn) closeHelpBtn.addEventListener("click", () => this.closeHelpGuideModal());
        if (closeHelpOverlay) {
            closeHelpOverlay.addEventListener("click", (e) => {
                if (e.target === closeHelpOverlay) this.closeHelpGuideModal();
            });
        }

        // Quiz Modal Triggers
        const launchQuizBtn = document.getElementById("launchUndertoneQuizBtn");
        const closeQuizBtn = document.getElementById("closeUndertoneQuizBtn");
        const closeQuizOverlay = document.getElementById("undertoneQuizModal");
        const applyQuizBtn = document.getElementById("applyQuizResultBtn");

        if (launchQuizBtn) launchQuizBtn.addEventListener("click", () => this.openQuizModal());
        if (closeQuizBtn) closeQuizBtn.addEventListener("click", () => this.closeQuizModal());
        if (closeQuizOverlay) {
            closeQuizOverlay.addEventListener("click", (e) => {
                if (e.target === closeQuizOverlay) this.closeQuizModal();
            });
        }
        if (applyQuizBtn) applyQuizBtn.addEventListener("click", () => this.applyQuizResult());

        // Keyboard ESC to close modals
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.closeQuizModal();
                this.closeHelpGuideModal();
            }
        });

        // Find My Colors CTA Jump
        const findMyColorsCta = document.getElementById("findMyColorsCta");
        if (findMyColorsCta) {
            findMyColorsCta.addEventListener("click", (e) => {
                e.preventDefault();
                const target = document.getElementById("colorGuideWorkspace");
                if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        }

        // Bridge: Filter Collection by Selected Color
        const filterCatalogBtn = document.getElementById("filterCatalogByColorBtn");
        if (filterCatalogBtn) {
            filterCatalogBtn.addEventListener("click", () => {
                if (!this.selectedColor) return;
                const searchInput = document.getElementById("productSearchInput");
                const productsSec = document.getElementById("products");

                // Look for color name keyword (e.g. "Emerald", "Coral", "Ruby", "Teal", "Navy")
                const primaryColorWord = this.selectedColor.name.split(" ")[0];
                if (searchInput) {
                    searchInput.value = primaryColorWord;
                    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
                }

                if (productsSec) {
                    productsSec.scrollIntoView({ behavior: "smooth" });
                }

                if (window.showToast) {
                    window.showToast(`Filtering collection for "${primaryColorWord}" dresses ✨`, "success");
                }
            });
        }
    }
}

// Instantiate on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    window.colorGuideStudio = new ColorGuideStudio();
});

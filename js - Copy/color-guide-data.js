// ==========================================================================
// VestiAI - Color Guide & Color Theory Data Model
// Realistic Skin Tones, Undertones, Recommendations, & Styling Logic
// ==========================================================================

export const skinTonesData = [
    {
        id: "very-fair",
        name: "Very Fair",
        toneCategory: "Fair",
        hex: "#FCE4D8",
        description: "Porcelain, alabaster, or ivory tones that are delicate and light-reflective.",
        contrastLevel: "High contrast with deep tones, ethereal with soft pastels."
    },
    {
        id: "fair",
        name: "Fair",
        toneCategory: "Fair",
        hex: "#F5D2BE",
        description: "Light peach, soft beige, or pale bisque with gentle warmth or rosy clarity.",
        contrastLevel: "Vibrant with jewel tones, harmonious with gentle muted shades."
    },
    {
        id: "light",
        name: "Light",
        toneCategory: "Light",
        hex: "#EBBFA4",
        description: "Warm ivory, sand, or light golden-beige with subtle natural warmth.",
        contrastLevel: "Striking with saturated hues and sophisticated earth tones."
    },
    {
        id: "light-medium",
        name: "Light-Medium",
        toneCategory: "Light-Medium",
        hex: "#DEA683",
        description: "Golden honey, light olive, or warm bisque complexions.",
        contrastLevel: "Superbly versatile with both rich autumn shades and bold vivids."
    },
    {
        id: "medium",
        name: "Medium",
        toneCategory: "Medium",
        hex: "#C68E6A",
        description: "Warm ochre, sun-kissed amber, and natural golden-beige hues.",
        contrastLevel: "Pairs effortlessly with jewel tones, terracotta, and deep forest greens."
    },
    {
        id: "wheatish",
        name: "Wheatish",
        toneCategory: "Medium",
        hex: "#B67B54",
        description: "Classic South Asian, Mediterranean, and Latin golden-amber complexions.",
        contrastLevel: "Radiant with warm spices, royal blues, emeralds, and glowing golds."
    },
    {
        id: "tan",
        name: "Tan",
        toneCategory: "Tan",
        hex: "#9F653E",
        description: "Caramel, bronze, and radiant toasted cinnamon skin tones.",
        contrastLevel: "Sensational with high-contrast whites, corals, cobalt, and rich berry hues."
    },
    {
        id: "deep-tan",
        name: "Deep Tan",
        toneCategory: "Deep Tan",
        hex: "#844C27",
        description: "Rich copper, bronze mahogany, and warm walnut skin tones.",
        contrastLevel: "Luminous against bright jewel tones, golds, and saturated pigments."
    },
    {
        id: "deep",
        name: "Deep",
        toneCategory: "Deep",
        hex: "#5C3116",
        description: "Warm espresso, chestnut, and rich mocha complexions with depth.",
        contrastLevel: "Breathtaking with vivid high-chroma tones, neons, and crisp light neutrals."
    },
    {
        id: "very-deep",
        name: "Very Deep",
        toneCategory: "Very Deep",
        hex: "#3D1D0D",
        description: "Velvet ebony, obsidian, and rich cacao skin tones with royal presence.",
        contrastLevel: "Electric with stark pure whites, vibrant fuchsias, emeralds, and bright golds."
    }
];

export const undertonesData = [
    {
        id: "warm",
        name: "Warm",
        badge: "Golden & Peachy",
        icon: "☀️",
        summary: "Skin has golden, peach, yellow, or reddish-amber undertones.",
        veinTrait: "Veins appear greenish or olive on inner wrists.",
        jewelryTrait: "Yellow gold and warm bronze illuminate your complexion effortlessly.",
        sunTrait: "Tans readily, rarely burns, or develops a golden glow.",
        fabricTrait: "Earthy creams, olive, terracotta, and warm reds make your skin look lively."
    },
    {
        id: "cool",
        name: "Cool",
        badge: "Rosy & Blue-based",
        icon: "❄️",
        summary: "Skin has hints of pink, rosy-red, or subtle blue undertones.",
        veinTrait: "Veins appear blue or purple on inner wrists.",
        jewelryTrait: "Silver, platinum, and white gold make your skin radiant.",
        sunTrait: "Tends to burn easily before tanning, or holds pink flush.",
        fabricTrait: "Crisp stark white, cobalt blue, emerald, and berry pink make your skin pop."
    },
    {
        id: "neutral",
        name: "Neutral",
        badge: "Balanced & Versatile",
        icon: "⚖️",
        summary: "Balanced mix of warm and cool tones, without an obvious yellow or pink cast.",
        veinTrait: "Veins look blue-green or a mixture of both blue and green.",
        jewelryTrait: "Both silver and yellow gold look equally flattering on you.",
        sunTrait: "May burn initially, then gradually deepens into a smooth tan.",
        fabricTrait: "You effortlessly rock both soft peach and dusty blues, charcoal, and jade."
    },
    {
        id: "olive",
        name: "Olive",
        badge: "Green & Ash Cast",
        icon: "🫒",
        summary: "Skin carries a distinctive greenish, greyish, or golden-green cast.",
        veinTrait: "Veins often appear deep olive-green or dark teal.",
        jewelryTrait: "Antique gold, brushed bronze, rose gold, and oxidized silver look striking.",
        sunTrait: "Tans very easily with an ashy-golden bronze glow, rarely burns.",
        fabricTrait: "Teal, rich olive, forest green, deep rust, and dusty mauve look mesmerizing."
    },
    {
        id: "not-sure",
        name: "Not Sure?",
        badge: "Quick Diagnostic",
        icon: "🔮",
        summary: "Take our 60-second interactive questionnaire to discover your natural undertone.",
        isQuizTrigger: true
    }
];

// Interactive Undertone Quiz Questions
export const undertoneQuizQuestions = [
    {
        id: "q_veins",
        title: "Look at the veins on the inside of your wrist in natural daylight:",
        options: [
            { label: "Noticeably green or olive", undertone: "warm", icon: "🌿" },
            { label: "Distinctly blue or purplish", undertone: "cool", icon: "🫐" },
            { label: "A mix of blue and green, or hard to tell", undertone: "neutral", icon: "✨" },
            { label: "Dark teal or grayish-green with an olive skin cast", undertone: "olive", icon: "🫒" }
        ]
    },
    {
        id: "q_jewelry",
        title: "Which metallic jewelry flatters your skin most naturally?",
        options: [
            { label: "Yellow gold brings out a luminous, healthy glow", undertone: "warm", icon: "👑" },
            { label: "Silver or white gold gives a crisp, radiant spark", undertone: "cool", icon: "💍" },
            { label: "Both look equally great; I switch between them anytime", undertone: "neutral", icon: "⚖️" },
            { label: "Rose gold, antique bronze, or brushed gold looks magical", undertone: "olive", icon: "🍂" }
        ]
    },
    {
        id: "q_sun",
        title: "How does your skin typically react after 30 minutes in strong sun?",
        options: [
            { label: "I tan easily and rarely or never burn", undertone: "warm", icon: "☀️" },
            { label: "I burn quickly, turn pink, and tan very slowly or not at all", undertone: "cool", icon: "🏖️" },
            { label: "I might turn pink first, but it turns into a nice tan shortly", undertone: "neutral", icon: "🌤️" },
            { label: "I tan almost immediately with an olive or bronze depth", undertone: "olive", icon: "🌴" }
        ]
    },
    {
        id: "q_white",
        title: "Hold a sheet of pure white paper under your chin in daylight. What tone is highlighted?",
        options: [
            { label: "My skin reflects warm yellow, peach, or golden tones", undertone: "warm", icon: "🍯" },
            { label: "My skin shows pink, rosy, or blueish-red tones", undertone: "cool", icon: "🌸" },
            { label: "Neither dominates; my skin looks balanced and neutral", undertone: "neutral", icon: "⚖️" },
            { label: "My skin shows a faint greenish, greenish-grey, or golden-olive cast", undertone: "olive", icon: "🍃" }
        ]
    }
];

// Color Recommendations Generator:
// Evaluates (skinToneId, undertoneId) and returns structured recommendations
export function getRecommendations(skinToneId, undertoneId) {
    const tone = skinTonesData.find(t => t.id === skinToneId) || skinTonesData[4];
    const isDeep = ["tan", "deep-tan", "deep", "very-deep"].includes(skinToneId);
    const isMedium = ["light-medium", "medium", "wheatish"].includes(skinToneId);
    const isFair = ["very-fair", "fair", "light"].includes(skinToneId);

    // Default to neutral if 'not-sure'
    const effectiveUndertone = undertoneId === "not-sure" ? "neutral" : undertoneId;

    let palette = {
        bestMatches: [],
        softElegant: [],
        boldVibrant: [],
        classicNeutrals: [],
        tryTheseToo: []
    };

    if (effectiveUndertone === "warm") {
        palette.bestMatches = [
            {
                name: "Terracotta Sunset",
                hex: "#CC5A36",
                textColor: "#FFFFFF",
                contrast: "Warm Harmonious",
                why: "Brings out the golden glow in your complexion while creating an earthy, romantic aura."
            },
            {
                name: "Warm Coral",
                hex: "#E06D53",
                textColor: "#FFFFFF",
                contrast: "Vibrant Warmth",
                why: "Instantly energizes warm undertones, adding a fresh, sun-kissed flush to facial contours."
            },
            {
                name: "Spiced Mustard",
                hex: "#D99B26",
                textColor: "#1A1A1A",
                contrast: "Golden Harmony",
                why: "Celebrates yellow and golden skin facets without washing you out."
            },
            {
                name: "Burnt Rust",
                hex: "#A83F1D",
                textColor: "#FFFFFF",
                contrast: "Rich Depth",
                why: "Adds striking definition and evening drama that enhances warm undertones seamlessly."
            }
        ];

        palette.softElegant = [
            {
                name: "Soft Peach Blossom",
                hex: "#F4B89D",
                textColor: "#2B1E17",
                contrast: "Gentle Daylight",
                why: "A soft, romantic shade that effortlessly mimics the natural flush of warm cheeks."
            },
            {
                name: "Warm Apricot",
                hex: "#EEA274",
                textColor: "#2B1E17",
                contrast: "Subtle Warmth",
                why: "Light and airy for daytime festivities, balancing golden undertones with sweetness."
            },
            {
                name: "Dusty Sandalwood",
                hex: "#C4977E",
                textColor: "#FFFFFF",
                contrast: "Refined Neutral",
                why: "A grounded, sophisticated muted tone that radiates timeless elegance."
            }
        ];

        palette.boldVibrant = [
            {
                name: "Fiery Poppy Red",
                hex: "#D63031",
                textColor: "#FFFFFF",
                contrast: "High Statement",
                why: "An orange-based crimson that makes warm skin pop in photos and evening light."
            },
            {
                name: "Golden Marigold",
                hex: "#F39C12",
                textColor: "#1A1A1A",
                contrast: "Vivid Radiance",
                why: "Bold and high-spirited, creating a breathtaking sunlit contrast."
            },
            {
                name: "Warm Emerald",
                hex: "#1E824C",
                textColor: "#FFFFFF",
                contrast: "Jewel Pop",
                why: "A yellow-undertone green that contrasts luxuriously with warm skin."
            }
        ];

        palette.classicNeutrals = [
            {
                name: "Rich Camel",
                hex: "#C19A6B",
                textColor: "#FFFFFF",
                contrast: "Couture Neutral",
                why: "Far superior to cool grays on warm skin, exuding tailored luxury."
            },
            {
                name: "Artisan Chocolate",
                hex: "#4E2F1D",
                textColor: "#FFFFFF",
                contrast: "Deep Velvety",
                why: "A delicious, grounding alternative to harsh black that flatters warm undertones."
            },
            {
                name: "Vanilla Cream",
                hex: "#F9F5EC",
                textColor: "#2D241E",
                contrast: "Soft Glow",
                why: "Gentler and more flattering than stark blue-white for warm skin."
            },
            {
                name: "Warm Olive Drab",
                hex: "#6B705C",
                textColor: "#FFFFFF",
                contrast: "Modern Neutral",
                why: "Acts as a sophisticated contemporary neutral dress color."
            }
        ];

        palette.tryTheseToo = [
            {
                name: "Teal Lagoon",
                hex: "#16797B",
                textColor: "#FFFFFF",
                contrast: "Complementary Surprise",
                why: "Because it contains yellow-green notes, teal creates a striking flattering contrast with warm undertones."
            },
            {
                name: "Plum Wine",
                hex: "#6C2D48",
                textColor: "#FFFFFF",
                contrast: "Dramatic Accent",
                why: "Warm berry tones provide majestic red-carpet contrast without clashing."
            }
        ];
    } else if (effectiveUndertone === "cool") {
        palette.bestMatches = [
            {
                name: "Royal Cobalt Blue",
                hex: "#1D4ED8",
                textColor: "#FFFFFF",
                contrast: "Electric Regal",
                why: "Amplifies the natural porcelain and rosy undertones, making complexions appear bright and awake."
            },
            {
                name: "Sapphire Night",
                hex: "#0F2B5C",
                textColor: "#FFFFFF",
                contrast: "Deep Sophistication",
                why: "A magnificent jewel tone that provides rich depth for gala and evening wear."
            },
            {
                name: "Vibrant Fuchsia",
                hex: "#D91B5C",
                textColor: "#FFFFFF",
                contrast: "High Chroma",
                why: "A blue-based vibrant magenta that gives cool skin a brilliant high-fashion pop."
            },
            {
                name: "Deep Emerald",
                hex: "#097969",
                textColor: "#FFFFFF",
                contrast: "Jewel Contrast",
                why: "Cool green with blue notes that frames cool complexions like a precious gem."
            }
        ];

        palette.softElegant = [
            {
                name: "Serene Lavender",
                hex: "#B8A9C9",
                textColor: "#2B1E3B",
                contrast: "Ethereal Pastel",
                why: "Soft lilac nuances soothe cool complexions with effortless daytime charm."
            },
            {
                name: "Dusty Rose",
                hex: "#C28285",
                textColor: "#FFFFFF",
                contrast: "Muted Romance",
                why: "Contains cool blue-pink pigment that harmonizes gracefully with cool undertones."
            },
            {
                name: "Powder Blue",
                hex: "#9DBEDD",
                textColor: "#1A2530",
                contrast: "Crisp Whisper",
                why: "Creates a fresh, luminous ambiance reminiscent of crisp morning couture."
            }
        ];

        palette.boldVibrant = [
            {
                name: "Ruby Crimson",
                hex: "#A3001E",
                textColor: "#FFFFFF",
                contrast: "Couture Red",
                why: "A blue-based pure ruby red that creates unforgettable evening statement looks."
            },
            {
                name: "Deep Imperial Plum",
                hex: "#4A154B",
                textColor: "#FFFFFF",
                contrast: "Regal Velvet",
                why: "Magnificently deep, creating contrast against both fair and deep cool complexions."
            },
            {
                name: "Electric Violet",
                hex: "#6C3483",
                textColor: "#FFFFFF",
                contrast: "Runway Punch",
                why: "Draws eyes immediately while honoring cool undertones."
            }
        ];

        palette.classicNeutrals = [
            {
                name: "Midnight Navy",
                hex: "#101827",
                textColor: "#FFFFFF",
                contrast: "Power Neutral",
                why: "The undisputed queen of neutrals for cool undertones—crisp, chic, and slimming."
            },
            {
                name: "True Diamond White",
                hex: "#FFFFFF",
                textColor: "#111827",
                contrast: "High Contrast",
                why: "Stark pure white enhances cool undertones whereas warm off-whites look muddy."
            },
            {
                name: "Slate Heather Gray",
                hex: "#708090",
                textColor: "#FFFFFF",
                contrast: "Modern Minimalist",
                why: "Sleek and architectural, providing an effortlessly poised background."
            },
            {
                name: "Pitch Noir",
                hex: "#0A0A0A",
                textColor: "#FFFFFF",
                contrast: "Dramatic Silhouette",
                why: "Crisp black sharpens cool facial features with red-carpet magnetism."
            }
        ];

        palette.tryTheseToo = [
            {
                name: "Icy Mint",
                hex: "#8FE3D9",
                textColor: "#163832",
                contrast: "Fresh Accent",
                why: "A crisp, cool pastel that delivers an unexpected, runway-ready burst of cool energy."
            },
            {
                name: "Berry Sangria",
                hex: "#7D1935",
                textColor: "#FFFFFF",
                contrast: "Sultry Pop",
                why: "Balances deep cherry warmth with cool wine notes for an intoxicating look."
            }
        ];
    } else if (effectiveUndertone === "olive") {
        palette.bestMatches = [
            {
                name: "Deep Peacock Teal",
                hex: "#006666",
                textColor: "#FFFFFF",
                contrast: "Signature Olive Match",
                why: "The holy grail shade for olive skin—rich blue-green notes harmonize with green undertones effortlessly."
            },
            {
                name: "Luxe Forest Pine",
                hex: "#1B4D3E",
                textColor: "#FFFFFF",
                contrast: "Natural Harmony",
                why: "Deep botanical green balances the unique olive depth without turning sallow."
            },
            {
                name: "Burnished Rust",
                hex: "#B34A26",
                textColor: "#FFFFFF",
                contrast: "Warm Counterbalance",
                why: "Red-orange warmth counters olive's greenish cast for a striking, healthy glow."
            },
            {
                name: "Mulberry Burgundy",
                hex: "#6B1D2F",
                textColor: "#FFFFFF",
                contrast: "Opulent Depth",
                why: "Rich wine-red provides gorgeous contrast that makes olive skin look luminous."
            }
        ];

        palette.softElegant = [
            {
                name: "Desert Taupe",
                hex: "#9E8B7D",
                textColor: "#FFFFFF",
                contrast: "Subtle Earth",
                why: "A nuanced neutral that flatters the green-ash undertone better than plain gray."
            },
            {
                name: "Dusty Plum Mauve",
                hex: "#8E6574",
                textColor: "#FFFFFF",
                contrast: "Romantic Softness",
                why: "Muted berry-mauve brings out the soft romantic side of olive tones."
            },
            {
                name: "Sage Whisper",
                hex: "#8A9A86",
                textColor: "#1C2E19",
                contrast: "Organic Calm",
                why: "Subtle herbal green that creates an understated, high-fashion monochrome vibe."
            }
        ];

        palette.boldVibrant = [
            {
                name: "Spiced Ochre Gold",
                hex: "#C68B18",
                textColor: "#FFFFFF",
                contrast: "Solar Energy",
                why: "Bold mustard gold makes olive skin appear golden and sun-kissed rather than green."
            },
            {
                name: "Vivid Moroccan Blue",
                hex: "#1A5276",
                textColor: "#FFFFFF",
                contrast: "Striking Jewel",
                why: "Deep Mediterranean blue that frames olive complexions with regal authority."
            },
            {
                name: "Fiery Coral Punch",
                hex: "#E74C3C",
                textColor: "#FFFFFF",
                contrast: "Complementary Pop",
                why: "Warm red sits opposite green on the color wheel, creating electric vibrancy."
            }
        ];

        palette.classicNeutrals = [
            {
                name: "Warm Alabaster Cream",
                hex: "#F4EFE6",
                textColor: "#2B261F",
                contrast: "Rich Alternative to White",
                why: "Far more flattering on olive tones than clinical stark white, keeping skin looking alive."
            },
            {
                name: "Smoky Charcoal",
                hex: "#343A40",
                textColor: "#FFFFFF",
                contrast: "Soft Noir",
                why: "Less abrasive than pitch black, emphasizing glowing olive jawlines."
            },
            {
                name: "Dark Espresso",
                hex: "#382212",
                textColor: "#FFFFFF",
                contrast: "Organic Luxury",
                why: "Deep earthy brown echoes natural olive undertones with couture sophistication."
            },
            {
                name: "Deep Mediterranean Navy",
                hex: "#1A2530",
                textColor: "#FFFFFF",
                contrast: "Timeless Tailoring",
                why: "A versatile wardrobe anchor that prevents skin from looking dull."
            }
        ];

        palette.tryTheseToo = [
            {
                name: "Cinnamon Bronze",
                hex: "#A25F2A",
                textColor: "#FFFFFF",
                contrast: "Metallic Warmth",
                why: "Highlights the golden undertones present in olive skin, ideal for evening gowns."
            },
            {
                name: "Deep Dusty Rose",
                hex: "#A36B73",
                textColor: "#FFFFFF",
                contrast: "Vintage Glamour",
                why: "Soft red undertone provides a flattering gentle counter to olive undertones."
            }
        ];
    } else {
        // Neutral undertone
        palette.bestMatches = [
            {
                name: "Cranberry Rose",
                hex: "#9B1B30",
                textColor: "#FFFFFF",
                contrast: "Balanced Crimson",
                why: "Neither strictly orange nor blue, this universal red delivers red-carpet perfection."
            },
            {
                name: "Misty Jade Green",
                hex: "#2E8B57",
                textColor: "#FFFFFF",
                contrast: "Calm Allure",
                why: "Balances cool green and warm earth, enhancing neutral balance."
            },
            {
                name: "Periwinkle Twilight",
                hex: "#5D6D7E",
                textColor: "#FFFFFF",
                contrast: "Harmonious Slate",
                why: "A soft blue-lavender hybrid that sits comfortably between warm and cool."
            },
            {
                name: "Champagne Blush",
                hex: "#E8C39E",
                textColor: "#302216",
                contrast: "Subtle Glow",
                why: "A warm-cool crossover neutral that illuminates neutral skin beautifully."
            }
        ];

        palette.softElegant = [
            {
                name: "Dusty Peony",
                hex: "#D48B96",
                textColor: "#2B161A",
                contrast: "Romantic Balance",
                why: "The perfect middle-ground pink that flatters without clashing."
            },
            {
                name: "Sage Linen",
                hex: "#9CAF88",
                textColor: "#1A2612",
                contrast: "Organic Serenity",
                why: "Soft herbal gray-green that breathes air into casual and cocktail dresses."
            },
            {
                name: "Dove Grey Melange",
                hex: "#A5A5AF",
                textColor: "#1D1D24",
                contrast: "Refined Modern",
                why: "Clean neutral base that lets your facial features take center stage."
            }
        ];

        palette.boldVibrant = [
            {
                name: "Classic True Emerald",
                hex: "#007A53",
                textColor: "#FFFFFF",
                contrast: "Universal Luxury",
                why: "Famous for being universally flattering on neutral skin of all depths."
            },
            {
                name: "Royal Velvet Amethyst",
                hex: "#6C3483",
                textColor: "#FFFFFF",
                contrast: "Jewel Magic",
                why: "Creates rich depth with equal measures of passionate red and cool blue."
            },
            {
                name: "Sunset Tangerine",
                hex: "#D35400",
                textColor: "#FFFFFF",
                contrast: "Bold Warm Accent",
                why: "Neutral skin can pull off bold warm colors with striking, editorial flair."
            }
        ];

        palette.classicNeutrals = [
            {
                name: "Soft True White",
                hex: "#FAF9F6",
                textColor: "#222222",
                contrast: "Pristine Luxury",
                why: "Slightly softened white that looks effortless on neutral undertones."
            },
            {
                name: "Midnight Obsidian",
                hex: "#121214",
                textColor: "#FFFFFF",
                contrast: "Sleek Contour",
                why: "A sharp, tailored staple that creates a stunning canvas for any silhouette."
            },
            {
                name: "Warm Taupe Gray",
                hex: "#8B8589",
                textColor: "#FFFFFF",
                contrast: "Balanced Midtone",
                why: "The ultimate chameleon neutral that shifts flatteringly with any light."
            },
            {
                name: "Couture Navy",
                hex: "#1B263B",
                textColor: "#FFFFFF",
                contrast: "Understated Power",
                why: "Rich, polished, and timeless across daytime and evening events."
            }
        ];

        palette.tryTheseToo = [
            {
                name: "Electric Teal",
                hex: "#008080",
                textColor: "#FFFFFF",
                contrast: "Versatile Statement",
                why: "Teal bridges cool blue and warm green, giving neutral skin vibrant vitality."
            },
            {
                name: "Rich Ochre",
                hex: "#B7791F",
                textColor: "#FFFFFF",
                contrast: "Warm Flare",
                why: "A golden-earth tone that adds warmth to neutral skin without overpowering it."
            }
        ];
    }

    // Depth fine-tuning adjustments for contrast advice:
    if (isDeep) {
        // Deep tones glow tremendously in high saturation & light contrasts
        palette.depthAdvice = "With your rich, deep skin depth, high-contrast combinations (like stark ivory, vibrant canary, cobalt, and radiant jewel tones) look exceptionally striking and regal. Saturated colors celebrate your natural depth without getting lost.";
    } else if (isFair) {
        // Fair tones shine with clear jewel tones and soft pastels
        palette.depthAdvice = "With your fair skin depth, medium-to-deep jewel tones (like emerald, sapphire, and ruby) create breathtaking contrast, while soft pastels create an ethereal, harmonious flow. Avoid muddy or washed-out shades.";
    } else {
        // Medium / Wheatish tones
        palette.depthAdvice = "With your medium or wheatish skin depth, you have great natural contrast latitude! Saturated warm spices, rich teals, royal blues, and warm golds illuminate your natural sunlit tones with effortless chic.";
    }

    return palette;
}

// Color Theory Educational Pillars
export const colorTheoryPillars = [
    {
        id: "color-wheel",
        title: "The Fashion Color Wheel",
        icon: "🎨",
        subtitle: "How shades talk to each other",
        description: "Understanding color relationships transforms how you style dresses and accessories.",
        rules: [
            {
                name: "Complementary Harmonies",
                badge: "High Drama & Pop",
                explanation: "Colors opposite each other on the wheel (like Teal and Terracotta, or Emerald and Ruby). They heighten each other's intensity, creating unforgettable red-carpet energy."
            },
            {
                name: "Analogous Harmonies",
                badge: "Serene & Sophisticated",
                explanation: "Colors that sit adjacent on the wheel (like Berry, Plum, and Rose). They flow together seamlessly for fluid, artistic luxury."
            },
            {
                name: "Monochromatic Styling",
                badge: "Chic & Elongating",
                explanation: "Variations in lightness and saturation of a single hue (e.g., Sky Blue dress with Navy jacket). Elongates your vertical silhouette effortlessly."
            },
            {
                name: "Triadic Harmonies",
                badge: "Dynamic Balance",
                explanation: "Three colors evenly spaced around the color wheel. Delivers vibrant yet balanced visual interest for runway-inspired statements."
            }
        ]
    },
    {
        id: "hue-value-chroma",
        title: "Hue, Value & Chroma in Fashion",
        icon: "💡",
        subtitle: "The three dimensions of every garment shade",
        description: "Why two 'red' dresses look completely different on you:",
        points: [
            {
                name: "Hue (The Base Family)",
                description: "The pure color name—such as Red, Blue, or Green. Determines whether the color leans warm (yellow base) or cool (blue base)."
            },
            {
                name: "Value (Lightness vs Darkness)",
                description: "How much white or black is in the color. Pastel blush has high value (light); deep wine has low value (dark). Matching value to your contrast level creates harmony."
            },
            {
                name: "Chroma (Saturation / Vibrancy)",
                description: "How vivid or muted a shade is. Bright neon fuchsia has high chroma; dusty mauve has low chroma. Highly saturated colors create focal points."
            }
        ]
    },
    {
        id: "fabric-lighting",
        title: "Fabric Finishes & Lighting Science",
        icon: "✨",
        subtitle: "How materials reshape color perception",
        description: "The exact same dye appears remarkably different depending on weave and texture:",
        fabrics: [
            {
                name: "Silk & Satin (Lustrous)",
                effect: "Reflects direct light, brightening the complexion and creating high-glow highlights. Perfect for evening galas."
            },
            {
                name: "Velvet (Light-Absorbing)",
                effect: "Absorbs ambient light, deepening saturated jewel tones (emerald, burgundy, midnight navy) with sumptuous mystery."
            },
            {
                name: "Linen & Raw Cotton (Matte)",
                effect: "Diffuses light evenly, softening colors into relaxed, grounded earth tones that look effortless in natural daylight."
            },
            {
                name: "Chiffon & Organza (Translucent)",
                effect: "Allows skin tone to subtly illuminate the fabric from beneath, creating an airy, weightless synergy."
            }
        ]
    },
    {
        id: "contrast-dressing",
        title: "Your Personal Contrast Rule",
        icon: "⚖️",
        subtitle: "High vs Low Contrast Styling",
        description: "Contrast is the difference in value between your skin, hair, and eyes:",
        contrastTypes: [
            {
                name: "High Contrast",
                definition: "E.g., Very dark hair + light skin, or deep skin + bright white smile/eyes.",
                stylingTip: "Wear stark contrasting elements (Black & White, Navy & Cream, Emerald & Ruby) without getting overwhelmed."
            },
            {
                name: "Medium Contrast",
                definition: "E.g., Wheatish or medium skin with warm brunette or bronze highlights.",
                stylingTip: "Thrives in rich, blended mid-tones (Teal, Terracotta, Coral, Spiced Mustard, Cobalt)."
            },
            {
                name: "Low / Soft Contrast",
                definition: "Skin, hair, and eye values are similarly soft and blended.",
                stylingTip: "Ton-sur-ton (tone-on-tone) and soft monochrome outfits flatter best without overpowering your features."
            }
        ]
    }
];

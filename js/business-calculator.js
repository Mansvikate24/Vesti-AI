// ==========================================================================
// VESTI-AI - INTERACTIVE BUSINESS MODEL & UNIT ECONOMICS CALCULATOR
// Computes hypothetical revenue, operating expenses, and net profit/loss
// for business planning, investor demonstrations, and college entrepreneurship.
// ==========================================================================

export function initBusinessCalculator() {
    // Input elements
    const retailersInput = document.getElementById("numRetailers");
    const retailersVal = document.getElementById("numRetailersVal");

    const subPriceInput = document.getElementById("subPrice");
    const subPriceVal = document.getElementById("subPriceVal");

    const dressesSoldInput = document.getElementById("dressesSold");
    const dressesSoldVal = document.getElementById("dressesSoldVal");

    const avgPriceInput = document.getElementById("avgPrice");
    const avgPriceVal = document.getElementById("avgPriceVal");

    const grossMarginInput = document.getElementById("grossMargin");
    const grossMarginVal = document.getElementById("grossMarginVal");

    const hostingCostInput = document.getElementById("hostingCost");
    const marketingCostInput = document.getElementById("marketingCost");
    const otherCostInput = document.getElementById("otherCost");

    // Output elements
    const outSubRevenue = document.getElementById("outSubRevenue");
    const outDressGross = document.getElementById("outDressGross");
    const outDressMarginRevenue = document.getElementById("outDressMarginRevenue");
    const outTotalRevenue = document.getElementById("outTotalRevenue");
    const outTotalExpenses = document.getElementById("outTotalExpenses");
    const outProfitLoss = document.getElementById("outProfitLoss");
    const outProfitStatus = document.getElementById("outProfitStatus");

    if (!retailersInput) return;

    function formatINR(val) {
        return "₹" + Math.round(val).toLocaleString("en-IN");
    }

    function calculate() {
        const retailers = parseInt(retailersInput.value, 10) || 0;
        const subPrice = parseFloat(subPriceInput.value) || 0;
        const dressesSold = parseInt(dressesSoldInput.value, 10) || 0;
        const avgPrice = parseFloat(avgPriceInput.value) || 0;
        const grossMarginPct = parseFloat(grossMarginInput.value) || 0;

        const hostingCost = parseFloat(hostingCostInput.value) || 0;
        const marketingCost = parseFloat(marketingCostInput.value) || 0;
        const otherCost = parseFloat(otherCostInput.value) || 0;

        // Display updated input values
        if (retailersVal) retailersVal.textContent = retailers.toLocaleString("en-IN");
        if (subPriceVal) subPriceVal.textContent = formatINR(subPrice);
        if (dressesSoldVal) dressesSoldVal.textContent = dressesSold.toLocaleString("en-IN");
        if (avgPriceVal) avgPriceVal.textContent = formatINR(avgPrice);
        if (grossMarginVal) grossMarginVal.textContent = grossMarginPct + "%";

        // 1. Subscription Revenue
        const subRevenue = retailers * subPrice;

        // 2. Direct Dress Sales Gross & Margin Contribution
        const dressGrossGMV = dressesSold * avgPrice;
        const dressMarginContribution = dressGrossGMV * (grossMarginPct / 100);

        // 3. Total Operational Revenue (Subscriptions + Gross Margin Contribution from dresses)
        const totalNetRevenue = subRevenue + dressMarginContribution;

        // 4. Operating Expenses
        const totalExpenses = hostingCost + marketingCost + otherCost;

        // 5. Operating Profit or Loss
        const netProfitLoss = totalNetRevenue - totalExpenses;

        // Update UI
        if (outSubRevenue) outSubRevenue.textContent = formatINR(subRevenue);
        if (outDressGross) outDressGross.textContent = formatINR(dressGrossGMV);
        if (outDressMarginRevenue) outDressMarginRevenue.textContent = formatINR(dressMarginContribution);
        if (outTotalRevenue) outTotalRevenue.textContent = formatINR(totalNetRevenue);
        if (outTotalExpenses) outTotalExpenses.textContent = formatINR(totalExpenses);

        if (outProfitLoss) {
            outProfitLoss.textContent = (netProfitLoss >= 0 ? "+" : "-") + formatINR(Math.abs(netProfitLoss));
            
            // Adjust visual badge and color
            if (netProfitLoss >= 0) {
                outProfitLoss.style.color = "#10b981";
                if (outProfitStatus) {
                    outProfitStatus.textContent = "Estimated Net Operating Profit";
                    outProfitStatus.className = "status-badge tested";
                }
            } else {
                outProfitLoss.style.color = "#ef4444";
                if (outProfitStatus) {
                    outProfitStatus.textContent = "Estimated Net Operating Deficit";
                    outProfitStatus.className = "status-badge partial";
                }
            }
        }
    }

    // Attach listeners
    const allInputs = [
        retailersInput, subPriceInput, dressesSoldInput,
        avgPriceInput, grossMarginInput, hostingCostInput,
        marketingCostInput, otherCostInput
    ];

    allInputs.forEach(input => {
        if (input) {
            input.addEventListener("input", calculate);
            input.addEventListener("change", calculate);
        }
    });

    // Run initial calculation
    calculate();

    // Preset button triggers for scenario testing
    const presetConservative = document.getElementById("presetConservative");
    const presetModerate = document.getElementById("presetModerate");
    const presetGrowth = document.getElementById("presetGrowth");

    if (presetConservative) {
        presetConservative.addEventListener("click", () => {
            retailersInput.value = 5;
            subPriceInput.value = 999;
            dressesSoldInput.value = 40;
            avgPriceInput.value = 2200;
            grossMarginInput.value = 25;
            hostingCostInput.value = 3500;
            marketingCostInput.value = 8000;
            otherCostInput.value = 5000;
            calculate();
        });
    }

    if (presetModerate) {
        presetModerate.addEventListener("click", () => {
            retailersInput.value = 25;
            subPriceInput.value = 1999;
            dressesSoldInput.value = 180;
            avgPriceInput.value = 2500;
            grossMarginInput.value = 30;
            hostingCostInput.value = 12000;
            marketingCostInput.value = 25000;
            otherCostInput.value = 15000;
            calculate();
        });
    }

    if (presetGrowth) {
        presetGrowth.addEventListener("click", () => {
            retailersInput.value = 80;
            subPriceInput.value = 2999;
            dressesSoldInput.value = 650;
            avgPriceInput.value = 2800;
            grossMarginInput.value = 35;
            hostingCostInput.value = 35000;
            marketingCostInput.value = 80000;
            otherCostInput.value = 40000;
            calculate();
        });
    }
}

// Auto init when document is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBusinessCalculator);
} else {
    initBusinessCalculator();
}

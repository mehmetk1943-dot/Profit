/* ===== Kara3 Pricing & Profit Calculator ===== */

(function () {
    'use strict';

    // Currency symbols
    const CURRENCY_SYMBOLS = {
        EUR: '\u20AC',
        USD: '$',
        TRY: '\u20BA',
        GBP: '\u00A3'
    };

    // Presets
    const PRESETS = {
        'moissanite-ring': {
            productName: 'Moissanite Ring',
            currency: 'EUR',
            productCost: 28,
            shippingCost: 5.50,
            packagingCost: 3.00,
            paymentFeePercent: 2.9,
            transactionFixedFee: 0.30,
            platformFeePercent: 0,
            returnRate: 6,
            returnCost: 8,
            vatRate: 19,
            includeVat: false,
            sellingPrice: 89,
            discountPercent: 10,
            targetMargin: 30,
            estimatedCPA: 12,
            estimatedROAS: 4.0,
            aovOverride: ''
        },
        'zultanite-necklace': {
            productName: 'Zultanite Necklace',
            currency: 'EUR',
            productCost: 35,
            shippingCost: 5.50,
            packagingCost: 3.50,
            paymentFeePercent: 2.9,
            transactionFixedFee: 0.30,
            platformFeePercent: 0,
            returnRate: 5,
            returnCost: 7,
            vatRate: 19,
            includeVat: false,
            sellingPrice: 119,
            discountPercent: 0,
            targetMargin: 35,
            estimatedCPA: 15,
            estimatedROAS: 3.5,
            aovOverride: ''
        },
        'silver-bracelet': {
            productName: 'Silver Bracelet',
            currency: 'EUR',
            productCost: 12,
            shippingCost: 4.00,
            packagingCost: 2.00,
            paymentFeePercent: 2.9,
            transactionFixedFee: 0.30,
            platformFeePercent: 5,
            returnRate: 8,
            returnCost: 6,
            vatRate: 19,
            includeVat: false,
            sellingPrice: 49,
            discountPercent: 15,
            targetMargin: 25,
            estimatedCPA: 8,
            estimatedROAS: 3.0,
            aovOverride: ''
        },
        'gold-plated-earrings': {
            productName: 'Gold-Plated Earrings',
            currency: 'USD',
            productCost: 18,
            shippingCost: 4.50,
            packagingCost: 2.50,
            paymentFeePercent: 2.9,
            transactionFixedFee: 0.30,
            platformFeePercent: 0,
            returnRate: 4,
            returnCost: 5,
            vatRate: 0,
            includeVat: false,
            sellingPrice: 65,
            discountPercent: 5,
            targetMargin: 30,
            estimatedCPA: 10,
            estimatedROAS: 3.8,
            aovOverride: ''
        }
    };

    // DOM references
    const fields = {
        productName: document.getElementById('productName'),
        currency: document.getElementById('currency'),
        productCost: document.getElementById('productCost'),
        shippingCost: document.getElementById('shippingCost'),
        packagingCost: document.getElementById('packagingCost'),
        paymentFeePercent: document.getElementById('paymentFeePercent'),
        transactionFixedFee: document.getElementById('transactionFixedFee'),
        platformFeePercent: document.getElementById('platformFeePercent'),
        returnRate: document.getElementById('returnRate'),
        returnCost: document.getElementById('returnCost'),
        vatRate: document.getElementById('vatRate'),
        includeVat: document.getElementById('includeVat'),
        sellingPrice: document.getElementById('sellingPrice'),
        discountPercent: document.getElementById('discountPercent'),
        targetMargin: document.getElementById('targetMargin'),
        estimatedCPA: document.getElementById('estimatedCPA'),
        estimatedROAS: document.getElementById('estimatedROAS'),
        aovOverride: document.getElementById('aovOverride')
    };

    // ===== Utility functions =====

    function getNum(field) {
        var val = parseFloat(field.value);
        return isNaN(val) ? 0 : val;
    }

    function getCurrencySymbol() {
        return CURRENCY_SYMBOLS[fields.currency.value] || '\u20AC';
    }

    function fmt(value) {
        var sym = getCurrencySymbol();
        return sym + value.toFixed(2);
    }

    function fmtPct(value) {
        return value.toFixed(1) + '%';
    }

    function setResult(id, text, cls) {
        var el = document.getElementById(id);
        el.textContent = text;
        el.className = 'result-value';
        if (cls) el.classList.add(cls);
    }

    function getVerdict(margin) {
        if (margin >= 25) return { label: 'Strong', cls: 'strong' };
        if (margin >= 15) return { label: 'Acceptable', cls: 'acceptable' };
        if (margin >= 0) return { label: 'Weak', cls: 'weak' };
        return { label: 'Loss-Making', cls: 'loss' };
    }

    // ===== Core calculation =====

    function calculate() {
        var sym = getCurrencySymbol();

        // Gather inputs
        var productCost = getNum(fields.productCost);
        var shippingCost = getNum(fields.shippingCost);
        var packagingCost = getNum(fields.packagingCost);
        var paymentFeePct = getNum(fields.paymentFeePercent) / 100;
        var txFixedFee = getNum(fields.transactionFixedFee);
        var platformFeePct = getNum(fields.platformFeePercent) / 100;
        var returnRatePct = getNum(fields.returnRate) / 100;
        var returnCostPer = getNum(fields.returnCost);
        var vatRatePct = getNum(fields.vatRate) / 100;
        var includeVat = fields.includeVat.checked;
        var sellingPrice = getNum(fields.sellingPrice);
        var discountPct = getNum(fields.discountPercent) / 100;
        var targetMarginPct = getNum(fields.targetMargin) / 100;
        var estimatedCPA = getNum(fields.estimatedCPA);
        var aovOverride = getNum(fields.aovOverride);

        // Final selling price after discount
        var finalPrice = sellingPrice * (1 - discountPct);

        // Revenue after VAT (if including VAT)
        var revenueNet = includeVat && vatRatePct > 0
            ? finalPrice / (1 + vatRatePct)
            : finalPrice;

        // Variable costs per order
        var paymentFee = revenueNet * paymentFeePct + txFixedFee;
        var platformFee = revenueNet * platformFeePct;
        var baseCost = productCost + shippingCost + packagingCost + paymentFee + platformFee;

        // VAT cost (if not included in price, VAT is an additional cost on profit)
        var vatCost = 0;
        if (!includeVat && vatRatePct > 0) {
            vatCost = revenueNet * vatRatePct;
        }

        var totalCostBeforeAds = baseCost + vatCost;

        // Expected return cost per order (spread across all orders)
        var returnCostPerOrder = returnRatePct * (returnCostPer + productCost);
        var totalCostWithReturns = totalCostBeforeAds + returnCostPerOrder;

        // Profit before ads
        var profitBeforeAds = revenueNet - totalCostWithReturns;

        // Net profit after CPA
        var netProfit = profitBeforeAds - estimatedCPA;

        // Margins
        var profitMargin = revenueNet > 0 ? (netProfit / revenueNet) * 100 : 0;
        var grossMargin = revenueNet > 0 ? (profitBeforeAds / revenueNet) * 100 : 0;

        // Break-even CPA (max ad spend per order before losing money)
        var breakEvenCPA = profitBeforeAds;

        // Break-even ROAS
        var aov = aovOverride > 0 ? aovOverride : finalPrice;
        var breakEvenROAS = profitBeforeAds > 0 ? aov / profitBeforeAds : 0;

        // Minimum viable selling price (total cost = revenue, no ads)
        // revenue - totalCostWithReturns = 0
        // For simplicity: minPrice = totalCostWithReturns / (1 - paymentFeePct - platformFeePct)
        var feeRate = paymentFeePct + platformFeePct;
        var minViablePrice = feeRate < 1
            ? (productCost + shippingCost + packagingCost + txFixedFee + returnCostPerOrder + vatCost) / (1 - feeRate)
            : 0;
        if (includeVat && vatRatePct > 0) {
            minViablePrice = minViablePrice * (1 + vatRatePct);
        }

        // Recommended price for target margin
        // revenue * (1 - targetMargin) = totalCostWithReturns + CPA
        // revenue = (totalCostWithReturns + CPA) / (1 - targetMargin)
        var recommendedRevenueNet = targetMarginPct < 1
            ? (totalCostWithReturns + estimatedCPA) / (1 - targetMarginPct)
            : 0;
        var recommendedPrice = recommendedRevenueNet;
        if (includeVat && vatRatePct > 0) {
            recommendedPrice = recommendedRevenueNet * (1 + vatRatePct);
        }
        // Account for discount: listed price should be higher
        if (discountPct > 0 && discountPct < 1) {
            recommendedPrice = recommendedPrice / (1 - discountPct);
        }

        // Safe discount room: how much discount before profit = 0 (with current CPA)
        // (sellingPrice * (1 - x)) adjusted net - totalCostWithReturns - CPA = 0
        var maxDiscountPrice = totalCostWithReturns + estimatedCPA;
        if (includeVat && vatRatePct > 0) {
            maxDiscountPrice = maxDiscountPrice * (1 + vatRatePct);
        }
        // Approximate: ignoring fee recalculation for simplicity
        var safeDiscountRoom = sellingPrice > 0
            ? Math.max(0, ((sellingPrice - maxDiscountPrice) / sellingPrice) * 100)
            : 0;

        // ===== Update UI =====

        // Core pricing
        setResult('outFinalPrice', fmt(finalPrice));
        setResult('outTotalCost', fmt(totalCostBeforeAds));
        setResult('outTotalCostReturns', fmt(totalCostWithReturns));
        setResult('outProfitBeforeAds', fmt(profitBeforeAds), profitBeforeAds >= 0 ? 'positive' : 'negative');
        setResult('outNetProfit', fmt(netProfit), netProfit >= 0 ? 'positive' : 'negative');
        setResult('outProfitMargin', fmtPct(profitMargin), profitMargin >= 15 ? 'positive' : profitMargin >= 0 ? 'warning' : 'negative');
        setResult('outGrossMargin', fmtPct(grossMargin), grossMargin >= 20 ? 'positive' : grossMargin >= 0 ? 'warning' : 'negative');

        // Break-even
        setResult('outBreakEvenCPA', fmt(breakEvenCPA), breakEvenCPA > 0 ? 'positive' : 'negative');
        setResult('outBreakEvenROAS', breakEvenROAS > 0 ? breakEvenROAS.toFixed(2) + 'x' : 'N/A');
        setResult('outMinPrice', fmt(minViablePrice));
        setResult('outRecommendedPrice', fmt(recommendedPrice));

        // Discount room
        setResult('outDiscountRoom', fmtPct(safeDiscountRoom), safeDiscountRoom > 10 ? 'positive' : safeDiscountRoom > 0 ? 'warning' : 'negative');

        // Verdict
        var verdict = getVerdict(profitMargin);
        var verdictEl = document.getElementById('outVerdict');
        verdictEl.textContent = verdict.label;
        verdictEl.className = 'result-value verdict ' + verdict.cls;

        // Warnings
        var warningsContainer = document.getElementById('warningsContainer');
        warningsContainer.innerHTML = '';
        var warnings = [];

        if (netProfit < 0) {
            warnings.push({ text: 'This product loses money after ad spend.', cls: 'warn-red' });
        }
        if (profitMargin < 15 && profitMargin >= 0) {
            warnings.push({ text: 'Margin is thin \u2014 limited room for scaling ads.', cls: 'warn-orange' });
        }
        if (safeDiscountRoom < 5 && netProfit >= 0) {
            warnings.push({ text: 'Almost no room for discounts. Be careful with promotions.', cls: 'warn-orange' });
        }
        if (profitBeforeAds < 0) {
            warnings.push({ text: 'Product is unprofitable even without ads. Review your costs.', cls: 'warn-red' });
        }
        if (netProfit > 0 && profitMargin >= 25) {
            warnings.push({ text: 'Healthy margin. Good room for growth and ad spend.', cls: 'warn-green' });
        }

        warnings.forEach(function (w) {
            var div = document.createElement('div');
            div.className = 'warning-item ' + w.cls;
            div.textContent = w.text;
            warningsContainer.appendChild(div);
        });

        // ===== Scenarios =====
        updateScenario('NoAds', profitBeforeAds, grossMargin, revenueNet);

        var moderateCPA = breakEvenCPA * 0.5;
        var moderateProfit = profitBeforeAds - moderateCPA;
        var moderateMargin = revenueNet > 0 ? (moderateProfit / revenueNet) * 100 : 0;
        updateScenario('Mod', moderateProfit, moderateMargin, revenueNet);

        var aggressiveCPA = breakEvenCPA * 0.9;
        var aggressiveProfit = profitBeforeAds - aggressiveCPA;
        var aggressiveMargin = revenueNet > 0 ? (aggressiveProfit / revenueNet) * 100 : 0;
        updateScenario('Agg', aggressiveProfit, aggressiveMargin, revenueNet);

        // ===== Summary =====
        var productName = fields.productName.value || 'This product';
        var summaryLines = [];
        summaryLines.push(productName + ' at ' + fmt(finalPrice) + (discountPct > 0 ? ' (after ' + (discountPct * 100).toFixed(0) + '% discount)' : '') + ':');
        summaryLines.push('');
        summaryLines.push('Total cost per order (incl. returns): ' + fmt(totalCostWithReturns));
        summaryLines.push('Profit before ads: ' + fmt(profitBeforeAds));
        summaryLines.push('Net profit after ' + fmt(estimatedCPA) + ' CPA: ' + fmt(netProfit));
        summaryLines.push('Profit margin: ' + fmtPct(profitMargin));
        summaryLines.push('Gross margin: ' + fmtPct(grossMargin));
        summaryLines.push('');
        summaryLines.push('Break-even CPA: ' + fmt(breakEvenCPA));
        summaryLines.push('Break-even ROAS: ' + (breakEvenROAS > 0 ? breakEvenROAS.toFixed(2) + 'x' : 'N/A'));
        summaryLines.push('Safe discount room: ' + fmtPct(safeDiscountRoom));
        summaryLines.push('');

        if (netProfit < 0) {
            summaryLines.push('Verdict: LOSS-MAKING. This product loses money with current pricing and ad costs. You need to increase the price, reduce costs, or lower your CPA.');
        } else if (profitMargin < 15) {
            summaryLines.push('Verdict: WEAK. The product is barely profitable. Margins are too thin for sustainable growth.');
        } else if (profitMargin < 25) {
            summaryLines.push('Verdict: ACCEPTABLE. The product makes money, but margins are moderate. Watch your ad spend carefully.');
        } else {
            summaryLines.push('Verdict: STRONG. This is a healthy product with good margins. You have room to invest in growth.');
        }

        document.getElementById('summaryBox').textContent = summaryLines.join('\n');
    }

    function updateScenario(prefix, profit, margin, revenue) {
        var sym = getCurrencySymbol();
        var profitEl = document.getElementById('scen' + prefix + 'Profit');
        var marginEl = document.getElementById('scen' + prefix + 'Margin');
        var verdictEl = document.getElementById('scen' + prefix + 'Verdict');

        profitEl.textContent = fmt(profit);
        profitEl.style.color = profit >= 0 ? 'var(--green)' : 'var(--red)';

        marginEl.textContent = fmtPct(margin);
        marginEl.style.color = margin >= 15 ? 'var(--green)' : margin >= 0 ? 'var(--orange)' : 'var(--red)';

        var v = getVerdict(margin);
        verdictEl.textContent = v.label;
        verdictEl.className = 'scenario-verdict ' + v.cls;
    }

    // ===== Load preset =====

    function loadPreset(name) {
        var preset = PRESETS[name];
        if (!preset) return;

        // Deactivate all preset buttons, activate current
        document.querySelectorAll('.preset-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.preset === name);
        });

        Object.keys(preset).forEach(function (key) {
            var field = fields[key];
            if (!field) return;
            if (key === 'includeVat') {
                field.checked = preset[key];
            } else if (key === 'aovOverride' && preset[key] === '') {
                field.value = '';
            } else {
                field.value = preset[key];
            }
        });

        calculate();
    }

    // ===== Reset =====

    function resetForm() {
        Object.keys(fields).forEach(function (key) {
            var field = fields[key];
            if (key === 'includeVat') {
                field.checked = false;
            } else if (key === 'currency') {
                field.value = 'EUR';
            } else {
                field.value = '';
            }
        });

        document.querySelectorAll('.preset-btn').forEach(function (btn) {
            btn.classList.remove('active');
        });

        // Reset outputs
        var resultValues = document.querySelectorAll('.result-value');
        resultValues.forEach(function (el) {
            el.textContent = '\u2014';
            el.className = 'result-value';
        });

        document.getElementById('warningsContainer').innerHTML = '';
        document.getElementById('summaryBox').textContent = 'Enter your product details and click Calculate to see a full analysis.';

        // Reset scenario verdicts
        ['NoAds', 'Mod', 'Agg'].forEach(function (prefix) {
            var ve = document.getElementById('scen' + prefix + 'Verdict');
            ve.textContent = '\u2014';
            ve.className = 'scenario-verdict';
        });
    }

    // ===== Copy summary =====

    function copySummary() {
        var summary = document.getElementById('summaryBox').textContent;
        var btn = document.getElementById('btnCopy');
        navigator.clipboard.writeText(summary).then(function () {
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(function () {
                btn.textContent = 'Copy Summary';
                btn.classList.remove('copied');
            }, 2000);
        }).catch(function () {
            // Fallback for older browsers
            var ta = document.createElement('textarea');
            ta.value = summary;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(function () {
                btn.textContent = 'Copy Summary';
                btn.classList.remove('copied');
            }, 2000);
        });
    }

    // ===== Download TXT =====

    function downloadTxt() {
        var name = fields.productName.value || 'pricing-analysis';
        var summary = document.getElementById('summaryBox').textContent;
        var header = '=== Kara3 Pricing & Profit Calculator ===\n';
        header += 'Generated: ' + new Date().toLocaleString() + '\n';
        header += '==========================================\n\n';

        var blob = new Blob([header + summary], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = name.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-').toLowerCase() + '-analysis.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ===== Event Listeners =====

    // Live calculation on input change
    var inputFields = document.querySelectorAll('input[type="number"], input[type="text"], select, input[type="checkbox"]');
    inputFields.forEach(function (field) {
        field.addEventListener('input', calculate);
        field.addEventListener('change', calculate);
    });

    // Buttons
    document.getElementById('btnCalculate').addEventListener('click', calculate);
    document.getElementById('btnReset').addEventListener('click', resetForm);
    document.getElementById('btnSample').addEventListener('click', function () {
        loadPreset('moissanite-ring');
    });
    document.getElementById('btnCopy').addEventListener('click', copySummary);
    document.getElementById('btnDownload').addEventListener('click', downloadTxt);

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            loadPreset(this.dataset.preset);
        });
    });
})();

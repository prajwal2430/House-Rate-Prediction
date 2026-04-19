/**
 * Currency Utility - USD to INR
 * Exchange rate: 1 USD = 83.5 INR
 */

const USD_TO_INR = 83.5;

/** Convert USD value to INR */
export const toINR = (usd) => Math.round(usd * USD_TO_INR);

/**
 * Format a number in the Indian numbering system
 * e.g. 12500000 -> "1,25,00,000"
 */
export const formatIndianNumber = (num) => {
    const s = Math.round(num).toString();
    const lastThree = s.slice(-3);
    const rest = s.slice(0, -3);
    const formatted = rest
        ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
        : lastThree;
    return formatted;
};

/**
 * Compact INR label: Crore / Lakh / plain
 * e.g. 12500000 -> "1.25 Cr"
 */
export const compactINR = (inrValue) => {
    const sym = '\u20B9';
    if (inrValue >= 1_00_00_000) {
        return sym + (inrValue / 1_00_00_000).toFixed(2) + ' Cr';
    }
    if (inrValue >= 1_00_000) {
        return sym + (inrValue / 1_00_000).toFixed(2) + ' L';
    }
    return sym + formatIndianNumber(inrValue);
};

/**
 * Full formatted price with Indian commas
 * e.g. 12500000 -> "1,25,00,000"
 */
export const fullINR = (inrValue) => '\u20B9' + formatIndianNumber(inrValue);
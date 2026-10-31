/* ==========================================================================
   UNKNOWN — product data & store configuration
   Prices are stored in NGN (base currency) and converted on display.
   Edit this file to add pieces, change stock, WhatsApp number or currencies.
   ========================================================================== */

const CONFIG = {
  // Change this to the store's real WhatsApp number (international format,
  // digits only — no "+", spaces or dashes).
  whatsappNumber: "2340000000000",
  defaultCurrency: "NGN",
  currencies: {
    NGN: { label: "NGN", code: "NGN", rate: 1, locale: "en-NG" },
    USD: { label: "USD", code: "USD", rate: 1 / 1600, locale: "en-US" },
    EUR: { label: "EUR", code: "EUR", rate: 1 / 1750, locale: "de-DE" },
    COP: { label: "COP", code: "COP", rate: 2.55, locale: "es-CO" },
  },
};

const PRODUCTS = [
  {
    id: "dzr-hoodie",
    name: "UNKNOWN DZR HOODIE",
    category: "HOODIE",
    type: "hoodie",
    price: 150000,
    color: { name: "Butter", hex: "#e2b32f" },
    sizes: { M: 4, L: 6, XL: 2, "2XL": 0 },
  },
  {
    id: "ligne-noire-hoodie",
    name: "UNKNOWN LIGNE NOIRE HOODIE",
    category: "HOODIE",
    type: "hoodie",
    price: 165000,
    color: { name: "Noir", hex: "#242422" },
    sizes: { M: 3, L: 5, XL: 4, "2XL": 2 },
  },
  {
    id: "rouge-tee",
    name: "UNKNOWN ROUGE TEE",
    category: "TEE",
    type: "tee",
    price: 85000,
    color: { name: "Rouge", hex: "#a73a32" },
    sizes: { M: 6, L: 4, XL: 0, "2XL": 3 },
  },
  {
    id: "blanc-tee",
    name: "UNKNOWN BLANC TEE",
    category: "TEE",
    type: "tee",
    price: 80000,
    color: { name: "Blanc", hex: "#eeece3" },
    sizes: { M: 5, L: 7, XL: 5, "2XL": 1 },
  },
  {
    id: "gris-jacket",
    name: "UNKNOWN GRIS JACKET",
    category: "JACKET",
    type: "jacket",
    price: 190000,
    color: { name: "Gris", hex: "#9a9a94" },
    sizes: { M: 2, L: 4, XL: 3, "2XL": 0 },
  },
  {
    id: "bleu-overshirt",
    name: "UNKNOWN BLEU OVERSHIRT",
    category: "JACKET",
    type: "jacket",
    price: 140000,
    color: { name: "Bleu", hex: "#4e6f8f" },
    sizes: { M: 4, L: 3, XL: 2, "2XL": 1 },
  },
];

const CURRENCY_ORDER = Object.keys(CONFIG.currencies);

/** Format a base (NGN) amount into the selected currency. */
function formatPrice(amountNGN, currency) {
  const c = CONFIG.currencies[currency] || CONFIG.currencies[CONFIG.defaultCurrency];
  const value = amountNGN * c.rate;
  const digits = currency === "COP" ? 0 : 2;

  return new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.code,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Total stock across all sizes (used for sold-out state). */
function totalStock(product) {
  return Object.values(product.sizes).reduce((sum, n) => sum + n, 0);
}

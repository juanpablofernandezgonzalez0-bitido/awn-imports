import fs from "fs";
import path from "path";
import { kv } from "@vercel/kv";
import { products as defaultProducts, type Product } from "./products";
import { site as defaultSite, type SiteConfig } from "./site";

const KV_PRODUCTS_KEY = "products";
const KV_SITE_KEY = "site";

function isKVAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/* ── Filesystem helpers ── */

const dataDir = path.join(process.cwd(), "data");
const productsFile = path.join(dataDir, "products.json");
const siteFile = path.join(dataDir, "site.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readJsonFile<T>(file: string, fallback: T): T {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    // corrupted, fall back
  }
  return fallback;
}

/* ── Public API ── */

export async function getProducts(): Promise<Product[]> {
  if (isKVAvailable()) {
    try {
      const data = await kv.get<Product[]>(KV_PRODUCTS_KEY);
      if (data) return data;
    } catch {
      // fall through to filesystem
    }
  }
  return readJsonFile<Product[]>(productsFile, defaultProducts);
}

export async function getSite(): Promise<SiteConfig> {
  if (isKVAvailable()) {
    try {
      const data = await kv.get<SiteConfig>(KV_SITE_KEY);
      if (data) return data;
    } catch {
      // fall through to filesystem
    }
  }
  return { ...readJsonFile<SiteConfig>(siteFile, defaultSite) };
}

export async function saveProducts(products: Product[]) {
  if (isKVAvailable()) {
    try {
      await kv.set(KV_PRODUCTS_KEY, products);
      return;
    } catch {
      // fall through to filesystem
    }
  }
  ensureDataDir();
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

export async function saveSite(siteConfig: SiteConfig) {
  if (isKVAvailable()) {
    try {
      await kv.set(KV_SITE_KEY, siteConfig);
      return;
    } catch {
      // fall through to filesystem
    }
  }
  ensureDataDir();
  fs.writeFileSync(siteFile, JSON.stringify(siteConfig, null, 2));
}

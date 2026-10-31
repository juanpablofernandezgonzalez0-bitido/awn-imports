"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { products as defaultProducts, type Product } from "@/lib/products";
import type { SiteConfig } from "@/lib/site";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { OPEN_SEARCH_EVENT, productHash, productIdFromHash } from "@/lib/events";


type SortKey = "destacados" | "precio-asc" | "precio-desc";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "destacados", label: "Destacados" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
];

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export default function Catalog({
  products,
  site,
}: {
  products?: Product[];
  site: SiteConfig;
}) {
  const all = products && products.length > 0 ? products : defaultProducts;
  const categories = useMemo(() => ["Todos", ...new Set(all.map((p) => p.category))], [all]);
  const [active, setActive] = useState<string>("Todos");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("destacados");
  const [selected, setSelected] = useState<Product | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusSearch = () => {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 450);
    };
    window.addEventListener(OPEN_SEARCH_EVENT, focusSearch);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, focusSearch);
  }, []);

  // Enlace directo: /#prenda-<id> abre la prenda al cargar la página.
  useEffect(() => {
    const openFromHash = () => {
      const id = productIdFromHash(window.location.hash);
      const match = id ? all.find((p) => p.id === id) : undefined;
      if (match) setSelected(match);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [all]);

  const openProduct = (product: Product) => {
    setSelected(product);
    window.history.replaceState(null, "", productHash(product.id));
  };

  const closeProduct = useCallback(() => {
    setSelected(null);
    if (productIdFromHash(window.location.hash)) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const visible = useMemo(() => {
    const q = normalize(query);
    const filtered = all.filter((p) => {
      if (active !== "Todos" && p.category !== active) return false;
      if (!q) return true;
      return normalize(`${p.name} ${p.category} ${p.description ?? ""}`).includes(q);
    });
    if (sort === "destacados") return filtered;
    // Las prendas sin precio (a consultar) siempre van al final.
    return [...filtered].sort((a, b) => {
      if (a.price <= 0 && b.price <= 0) return 0;
      if (a.price <= 0) return 1;
      if (b.price <= 0) return -1;
      return sort === "precio-asc" ? a.price - b.price : b.price - a.price;
    });
  }, [all, active, query, sort]);

  const showCategories = categories.length > 2;
  const hasFilters = query !== "" || active !== "Todos";

  const resetFilters = () => {
    setQuery("");
    setActive("Todos");
  };

  return (
    <section id="catalogo" className="scroll-mt-28 py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 48 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4 h-[2px] bg-neutral-900"
            />
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-5xl">
              Catálogo
            </h2>
            <p className="mt-3 text-sm text-neutral-500">
              {all.length} {all.length === 1 ? "prenda disponible" : "prendas disponibles"}
            </p>
          </div>

          {showCategories && (
            <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0 lg:gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  aria-pressed={active === cat}
                  className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 lg:px-7 lg:py-3 lg:text-sm ${
                    active === cat
                      ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Barra de herramientas: búsqueda, orden y conteo */}
        <div className="sticky top-[6.5rem] z-30 -mx-6 mt-10 border-y border-neutral-200/70 bg-white/85 px-6 py-3 backdrop-blur-xl sm:top-[6.75rem] sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Buscar prendas</span>
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setQuery("")}
                placeholder="Buscar por nombre, categoría o descripción"
                className="h-11 w-full rounded-full bg-neutral-100 pl-11 pr-10 text-sm text-neutral-900 outline-none ring-1 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-neutral-900 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-900"
                >
                  <X size={14} />
                </button>
              )}
            </label>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <p className="text-xs font-medium tabular-nums text-neutral-500" aria-live="polite">
                {visible.length} {visible.length === 1 ? "resultado" : "resultados"}
              </p>
              <label className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ordenar</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-11 cursor-pointer rounded-full bg-neutral-100 px-4 text-sm font-medium text-neutral-900 outline-none ring-1 ring-transparent transition hover:bg-neutral-200 focus:ring-neutral-900"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <motion.div
          layout
          className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} site={site} onSelect={openProduct} />
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">
              {query ? `Sin resultados para “${query}”` : "No hay prendas en esta categoría"}
            </p>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="rounded-full bg-neutral-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800"
              >
                Ver todo el catálogo
              </button>
            )}
          </motion.div>
        )}
      </div>

      <ProductModal product={selected} site={site} onClose={closeProduct} />
    </section>
  );
}

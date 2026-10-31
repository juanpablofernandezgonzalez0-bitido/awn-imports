"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { products as defaultProducts, type Product } from "@/lib/products";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

export default function Catalog({
  products: serverProducts,
  site: serverSite,
}: {
  products?: Product[];
  site: any;
}) {
  const [all, setAll] = useState<Product[]>(serverProducts ?? defaultProducts);
  const [site, setSite] = useState(serverSite);
  const categories = ["Todos", ...new Set(all.map((p) => p.category))];
  const [active, setActive] = useState<string>("Todos");
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/site").then((r) => r.json()),
    ]).then(([products, siteConfig]) => {
      if (Array.isArray(products) && products.length > 0) setAll(products);
      if (siteConfig && siteConfig.brand) setSite(siteConfig);
    }).catch(() => {});
  }, []);

  const visible = active === "Todos" ? all : all.filter((p) => p.category === active);

  return (
    <section id="catalogo" className="py-20 sm:py-28 lg:py-36">
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
          </div>

          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0 lg:gap-3">
            {categories.map((cat, i) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                onClick={() => setActive(cat)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 lg:px-7 lg:py-3 lg:text-sm ${
                  active === cat
                    ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          layout
          className="mt-14 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                site={site}
                onSelect={setSelected}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">
              No hay prendas en esta categoría
            </p>
          </motion.div>
        )}
      </div>

      <ProductModal product={selected} site={site} onClose={() => setSelected(null)} />
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Camera } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatCOP, formatPrice } from "@/lib/site";

function getAllImages(product: Product): string[] {
  if (product.images && product.images.length > 0) return product.images;
  if (product.image) return [product.image];
  return [];
}

export default function ProductCard({
  product,
  site,
  onSelect,
}: {
  product: Product;
  site: any;
  onSelect: (product: Product) => void;
}) {
  const imgs = getAllImages(product);
  const count = imgs.length;
  const [hovered, setHovered] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);

  useEffect(() => {
    if (!hovered || count <= 1) return;
    setPreviewIdx(0);
    const interval = setInterval(() => {
      setPreviewIdx((prev) => (prev + 1) % count);
    }, 1800);
    return () => clearInterval(interval);
  }, [hovered, count]);

  const renderImage = (src: string, className: string, priority?: boolean) =>
    src.startsWith("data:") ? (
      <img src={src} alt={product.name} className={className} />
    ) : (
      <Image
        src={src}
        alt={product.name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className={className}
        priority={priority}
      />
    );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onSelect(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 lg:rounded-3xl">
        {count > 1 ? (
          <>
            {imgs.map((src, i) => (
              <div
                key={src}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  i === previewIdx ? "opacity-100" : "opacity-0"
                }`}
              >
                {renderImage(src, "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105")}
              </div>
            ))}
          </>
        ) : count === 1 ? (
          renderImage(imgs[0], "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105", true)
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-100 text-neutral-300">
            <span className="text-xs font-bold uppercase">Sin foto</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

        {count > 1 && (
          <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 backdrop-blur-md sm:left-3 sm:top-3 lg:left-4 lg:top-4">
            <Camera size={10} className="text-white/90 lg:hidden" />
            <Camera size={14} className="text-white/90 hidden lg:block" />
            <span className="text-[9px] font-bold text-white/90 sm:text-[10px] lg:text-xs">{count}</span>
          </div>
        )}

        {product.outOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-900 shadow-lg sm:text-xs lg:px-6 lg:py-2 lg:text-sm">Agotado</span>
          </div>
        )}

        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute right-2.5 top-2.5 z-10 rounded-full bg-red-500 px-2 py-1 text-[9px] font-bold text-white sm:right-3 sm:top-3 sm:text-[10px] lg:right-4 lg:top-4 lg:px-3 lg:text-xs">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </div>
        )}

        {count > 1 && (
          <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {imgs.slice(0, 6).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i === previewIdx
                    ? "h-1.5 w-4 bg-white"
                    : "h-1.5 w-1.5 bg-white/40"
                }`}
              />
            ))}
            {count > 6 && <span className="text-[8px] text-white/60 ml-0.5">+{count - 6}</span>}
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-between opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 z-10">
          <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-900 backdrop-blur-md sm:text-xs lg:py-3 lg:text-sm">
            Ver detalles
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-2 px-1 sm:mt-3">
        <div className="min-w-0 flex-1">
          <h3 className={`font-display text-[11px] font-bold uppercase leading-tight tracking-tight transition-colors duration-300 group-hover:text-neutral-600 sm:text-sm lg:text-base ${product.outOfStock ? "text-neutral-400" : "text-neutral-900"}`}>
            {product.name}
          </h3>
          <p className="mt-0.5 text-[10px] text-neutral-400 sm:text-xs lg:text-sm">
            {product.category}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {product.originalPrice && product.originalPrice > product.price ? (
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-[10px] font-bold tabular-nums text-neutral-400 line-through sm:text-xs lg:text-sm">{formatCOP(product.originalPrice)}</span>
              <span className="font-display text-[11px] font-bold tabular-nums text-red-600 sm:text-sm lg:text-base">{formatCOP(product.price)}</span>
            </div>
          ) : (
            <p className={`font-display text-[11px] font-bold tabular-nums sm:text-sm lg:text-base ${product.outOfStock || product.price <= 0 ? "text-neutral-400" : "text-neutral-900"}`}>
              {formatPrice(product.price)}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}

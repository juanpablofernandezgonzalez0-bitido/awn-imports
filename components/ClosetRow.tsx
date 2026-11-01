"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw, ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatCOP, formatPrice } from "@/lib/site";

function getAllImages(product: Product): string[] {
  if (product.images && product.images.length > 0) return product.images;
  if (product.image) return [product.image];
  return [];
}

function Photo({ src, alt }: { src: string; alt: string }) {
  if (src.startsWith("data:")) {
    return <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 260px, (min-width: 640px) 240px, 62vw"
      className="object-cover"
    />
  );
}

/** Gancho de ropa: el aro se apoya sobre la barra del clóset. */
function Hanger({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 58" fill="none" aria-hidden="true" className={className}>
      <path
        d="M100 28 V20 C100 15 107 13 108 7 C109 2 104 -1 99.5 1.2 C96.5 2.6 96 5.5 96.5 7"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M100 28 L14 50 C8 51.6 8.5 56 14 56 H186 C191.5 56 192 51.6 186 50 Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClosetItem({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: (product: Product) => void;
}) {
  const imgs = getAllImages(product);
  const [front, back] = imgs;
  const [flipped, setFlipped] = useState(false);
  const hasDiscount = !!(product.originalPrice && product.originalPrice > product.price);
  const category = product.category.toLowerCase() === "sin categoria" ? "AWN IMPORT" : product.category;

  return (
    <li className="closet-item group relative w-[62vw] max-w-[280px] shrink-0 snap-start sm:w-[240px] lg:w-[260px]">
      <div className="closet-hang">
        <Hanger className="relative z-10 mx-auto -mb-2 block h-auto w-[82%] text-neutral-400 transition-colors duration-300 group-hover:text-neutral-700" />

        <div className="relative">
        <div
          role="button"
          tabIndex={0}
          aria-label={`Ver ${product.name}`}
          onClick={() => onSelect(product)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(product);
            }
          }}
          className="relative aspect-[3/4] w-full cursor-pointer rounded-2xl outline-none [perspective:1400px] focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-4"
        >
          <div className="closet-flip relative h-full w-full" data-flipped={flipped}>
            {/* Frente */}
            <div className="closet-face absolute inset-0 overflow-hidden rounded-2xl bg-neutral-200 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
              {front ? (
                <Photo src={front} alt={product.name} />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Sin foto
                </div>
              )}

              <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
                {product.tag && (
                  <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {product.tag}
                  </span>
                )}
                {hasDiscount && (
                  <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white">
                    -{Math.round((1 - product.price / product.originalPrice!) * 100)}%
                  </span>
                )}
              </div>

              {product.outOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <span className="rounded-full bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-900">
                    Agotado
                  </span>
                </div>
              )}
            </div>

            {/* Espalda: segunda foto si existe; si no, ficha de la prenda */}
            <div className="closet-face closet-face-back absolute inset-0 overflow-hidden rounded-2xl bg-neutral-900 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] ring-1 ring-black/10">
              {back ? (
                <>
                  <Photo src={back} alt={`${product.name}, vista posterior`} />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900 backdrop-blur">
                    Espalda
                  </span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-12">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                      Ver detalles <ArrowUpRight size={14} />
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col justify-between p-5 text-white">
                  <div className="pr-12 [@media(hover:hover)_and_(pointer:fine)]:pr-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">{category}</p>
                    <p className="mt-2 font-display text-lg font-bold uppercase leading-tight">{product.name}</p>
                    {product.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/60">{product.description}</p>
                    )}
                  </div>
                  <div>
                    {product.sizes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizes.map((s) => (
                          <span
                            key={s}
                            className="flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[11px] font-bold text-white/80 ring-1 ring-white/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Ver detalles <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* En pantallas táctiles no hay hover: botón para girar la prenda */}
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? "Ver frente de la prenda" : "Girar la prenda"}
          aria-pressed={flipped}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-md ring-1 ring-black/5 backdrop-blur [@media(hover:hover)_and_(pointer:fine)]:hidden"
        >
          <RotateCw size={16} className={`transition-transform duration-500 ${flipped ? "rotate-180" : ""}`} />
        </button>
        </div>

        <div className="mt-3 flex items-start justify-between gap-2 px-1">
          <div className="min-w-0">
            <h3
              className={`truncate font-display text-sm font-bold uppercase tracking-tight ${
                product.outOfStock ? "text-neutral-400" : "text-neutral-900"
              }`}
            >
              {product.name}
            </h3>
            <p className="mt-0.5 text-xs text-neutral-400">{category}</p>
          </div>
          <div className="shrink-0 text-right">
            {hasDiscount && (
              <p className="text-[11px] font-bold tabular-nums text-neutral-400 line-through">
                {formatCOP(product.originalPrice!)}
              </p>
            )}
            <p
              className={`font-display text-sm font-bold tabular-nums ${
                hasDiscount ? "text-red-600" : product.price > 0 && !product.outOfStock ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}

/** Prenda fotografiada en su propio gancho y sin fondo: cuelga directamente de la barra. */
function HangingItem({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: (product: Product) => void;
}) {
  const [front, back] = getAllImages(product);
  const [flipped, setFlipped] = useState(false);
  const hasDiscount = !!(product.originalPrice && product.originalPrice > product.price);
  const category = product.category.toLowerCase() === "sin categoria" ? "AWN IMPORT" : product.category;

  const cutout = (src: string, alt: string) =>
    src.startsWith("data:") ? (
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-contain object-top drop-shadow-[0_18px_16px_rgba(0,0,0,0.22)]" />
    ) : (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 260px, (min-width: 640px) 240px, 62vw"
        className="object-contain object-top drop-shadow-[0_18px_16px_rgba(0,0,0,0.22)]"
      />
    );

  return (
    <li className="closet-item group relative w-[62vw] max-w-[280px] shrink-0 snap-start sm:w-[240px] lg:w-[260px]">
      {/* El balanceo pivota en la punta del gancho, que se apoya sobre la barra */}
      <div className="closet-hang" style={{ transformOrigin: "50% 0.5%" }}>
        <div className="relative">
          <div
            role="button"
            tabIndex={0}
            aria-label={`Ver ${product.name}`}
            onClick={() => onSelect(product)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(product);
              }
            }}
            className="relative aspect-[3/4] w-full cursor-pointer rounded-2xl outline-none [perspective:1400px] focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-4"
          >
            <div className="closet-flip relative h-full w-full" data-flipped={flipped}>
              <div className="closet-face absolute inset-0">{front && cutout(front, product.name)}</div>
              <div className="closet-face closet-face-back absolute inset-0">
                {cutout(back ?? front, `${product.name}, vista posterior`)}
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-1.5">
              {product.tag && (
                <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {product.tag}
                </span>
              )}
              {hasDiscount && (
                <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white">
                  -{Math.round((1 - product.price / product.originalPrice!) * 100)}%
                </span>
              )}
            </div>

            {product.outOfStock && (
              <div className="pointer-events-none absolute inset-x-0 top-1/2 flex justify-center">
                <span className="rounded-full bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-900 shadow-md">
                  Agotado
                </span>
              </div>
            )}
          </div>

          {back && (
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? "Ver frente de la prenda" : "Ver espalda de la prenda"}
              aria-pressed={flipped}
              className="absolute bottom-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-md ring-1 ring-black/5 backdrop-blur [@media(hover:hover)_and_(pointer:fine)]:hidden"
            >
              <RotateCw size={16} className={`transition-transform duration-500 ${flipped ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-start justify-between gap-2 px-1">
          <div className="min-w-0">
            <h3 className={`truncate font-display text-sm font-bold uppercase tracking-tight ${product.outOfStock ? "text-neutral-400" : "text-neutral-900"}`}>
              {product.name}
            </h3>
            <p className="mt-0.5 text-xs text-neutral-400">{category}</p>
          </div>
          <div className="shrink-0 text-right">
            {hasDiscount && (
              <p className="text-[11px] font-bold tabular-nums text-neutral-400 line-through">{formatCOP(product.originalPrice!)}</p>
            )}
            <p
              className={`font-display text-sm font-bold tabular-nums ${
                hasDiscount ? "text-red-600" : product.price > 0 && !product.outOfStock ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function ClosetRow({
  title,
  index,
  products,
  onSelect,
}: {
  title: string;
  index: number;
  products: Product[];
  onSelect: (product: Product) => void;
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = railRef.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateArrows, products]);

  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-label={title}
    >
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-xs font-bold tabular-nums text-neutral-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-xl font-bold uppercase tracking-tight sm:text-2xl">{title}</h3>
          <span className="text-xs font-medium text-neutral-400">
            {products.length} {products.length === 1 ? "prenda" : "prendas"}
          </span>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            aria-label={`Anteriores en ${title}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 ring-1 ring-neutral-200 transition hover:bg-neutral-900 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            aria-label={`Siguientes en ${title}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 ring-1 ring-neutral-200 transition hover:bg-neutral-900 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Nicho del clóset */}
      <div className="relative -mx-6 mt-5 overflow-hidden bg-gradient-to-b from-neutral-200/70 via-neutral-100 to-neutral-50 sm:mx-0 sm:rounded-[2rem] sm:ring-1 sm:ring-neutral-200/80">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/[0.06] to-transparent" />

        {/* Barra del clóset */}
        <div className="pointer-events-none absolute inset-x-0 top-6 z-0 h-[7px] rounded-full bg-gradient-to-b from-neutral-300 via-white to-neutral-400 shadow-[0_3px_6px_rgba(0,0,0,0.18)] sm:inset-x-4" />

        {canPrev && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-neutral-100 to-transparent sm:w-16" />
        )}
        {canNext && (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-neutral-100 to-transparent sm:w-16" />
        )}

        <ul
          ref={railRef}
          onScroll={updateArrows}
          className="no-scrollbar relative z-10 flex snap-x snap-mandatory scroll-px-6 gap-5 overflow-x-auto px-6 pb-8 pt-[1.4rem] sm:scroll-px-8 sm:gap-7 sm:px-8"
        >
          {products.map((product) => (
            product.hanger ? (
              <HangingItem key={product.id} product={product} onSelect={onSelect} />
            ) : (
              <ClosetItem key={product.id} product={product} onSelect={onSelect} />
            )
          ))}
        </ul>
      </div>
    </motion.section>
  );
}

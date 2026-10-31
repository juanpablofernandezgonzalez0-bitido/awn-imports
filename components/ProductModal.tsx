"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowUpRight, ChevronLeft, ChevronRight, ShoppingBag, Check } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatCOP, waLink } from "@/lib/site";
import { useCart } from "@/lib/cart";

function getAllImages(product: Product): string[] {
  if (product.images && product.images.length > 0) return product.images;
  if (product.image) return [product.image];
  return [];
}

export default function ProductModal({
  product,
  site,
  onClose,
}: {
  product: Product | null;
  site: any;
  onClose: () => void;
}) {
  const [size, setSize] = useState<string | null>(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (product) { setSize(null); setCurrentImg(0); setAdded(false); setDirection(0); setTouchDelta(0); }
  }, [product]);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight") goNext();
        if (e.key === "ArrowLeft") goPrev();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [product, onClose, currentImg]);

  const imgs = product ? getAllImages(product) : [];

  const goNext = useCallback(() => {
    if (currentImg < imgs.length - 1) {
      setDirection(1);
      setCurrentImg((c) => c + 1);
    }
  }, [currentImg, imgs.length]);

  const goPrev = useCallback(() => {
    if (currentImg > 0) {
      setDirection(-1);
      setCurrentImg((c) => c - 1);
    }
  }, [currentImg]);

  const goTo = useCallback((index: number) => {
    setDirection(index > currentImg ? 1 : -1);
    setCurrentImg(index);
  }, [currentImg]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  };

  const handleTouchEnd = () => {
    if (touchStart === null) return;
    if (Math.abs(touchDelta) > 60) {
      if (touchDelta < 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
    setTouchDelta(0);
  };

  const message = product
    ? `Hola AWN IMPORT 👋, me interesa la prenda "${product.name}" (${formatCOP(
        product.price
      )})${size ? ` en talla ${size}` : ""}.`
    : "";

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
        >
          <motion.button
            aria-label="Cerrar"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full flex-col overflow-y-auto overflow-x-hidden bg-white shadow-2xl sm:overflow-hidden sm:max-w-3xl sm:flex-row sm:rounded-3xl sm:max-h-[88dvh] xl:max-w-5xl"
            style={{ maxHeight: "100dvh" }}
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="sticky top-3 ml-auto mr-3 z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:scale-110 sm:absolute sm:right-4 sm:top-4 sm:ml-0 sm:mr-0 sm:bg-white/90 sm:text-neutral-900"
            >
              <X size={18} />
            </button>

            <div className="relative w-full bg-neutral-100 overflow-hidden shrink-0 sm:w-[45%] sm:shrink sm:overflow-y-auto sm:max-h-[88dvh] sm:rounded-l-3xl xl:w-[55%]">
              <div
                className="relative w-full overflow-hidden touch-pan-y aspect-square sm:aspect-auto sm:min-h-[480px] lg:min-h-[560px]"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={`${product.id}-${currentImg}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0"
                    style={{ touchAction: "pan-y" }}
                  >
                    {imgs.length > 0 ? (
                      imgs[currentImg]?.startsWith("data:") ? (
                        <img
                          src={imgs[currentImg]}
                          alt={product.name}
                          className="h-full w-full object-contain bg-neutral-100"
                        />
                      ) : (
                        <Image
                          src={imgs[currentImg]}
                          alt={product.name}
                          fill
                          sizes="(min-width: 640px) 384px, 100vw"
                          className="object-contain"
                          priority
                        />
                      )
                    ) : (
                      <div className="flex h-full min-h-[50vh] items-center justify-center text-neutral-300">
                        <span className="text-sm font-bold uppercase">Sin foto</span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {imgs.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); goPrev(); }}
                      disabled={currentImg === 0}
                      className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-black/50 hover:scale-110 disabled:opacity-0 sm:bg-white/90 sm:text-neutral-900"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); goNext(); }}
                      disabled={currentImg === imgs.length - 1}
                      className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-black/50 hover:scale-110 disabled:opacity-0 sm:bg-white/90 sm:text-neutral-900"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {product.tag && (
                  <span className="absolute left-3 top-3 z-20 rounded-full bg-neutral-900 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-white shadow-lg sm:left-4 sm:top-4 sm:text-xs">
                    {product.tag}
                  </span>
                )}

                {imgs.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md">
                    {imgs.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); goTo(i); }}
                        className={`rounded-full transition-all duration-400 ${
                          i === currentImg
                            ? "h-2 w-6 bg-white"
                            : "h-2 w-2 bg-white/40 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <div className="absolute right-3 top-3 z-20 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md sm:right-auto sm:left-3 sm:top-auto sm:bottom-3">
                  {currentImg + 1}/{imgs.length}
                </div>

                {touchStart !== null && Math.abs(touchDelta) > 20 && (
                  <div
                    className="absolute inset-y-0 z-10 flex items-center pointer-events-none"
                    style={{
                      [touchDelta > 0 ? "left" : "right"]: 0,
                      opacity: Math.min(Math.abs(touchDelta) / 100, 0.8),
                    }}
                  >
                    {touchDelta > 0 ? (
                      <ChevronLeft size={32} className="text-white ml-3" />
                    ) : (
                      <ChevronRight size={32} className="text-white mr-3" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col p-5 sm:overflow-y-auto sm:p-6 lg:p-10 sm:min-h-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 lg:text-xs">
                    {product.category}
                  </p>
                  <h3 className="mt-1.5 font-display text-xl font-bold uppercase tracking-tight sm:text-2xl lg:text-3xl xl:text-4xl">
                    {product.name}
                  </h3>

                  {product.originalPrice && product.originalPrice > product.price ? (
                    <div className="mt-2 rounded-2xl bg-red-50 p-3 sm:p-4 lg:p-5">
                      <div className="flex items-baseline gap-3">
                        <p className="font-display text-2xl font-bold tabular-nums text-red-600 sm:text-3xl lg:text-4xl">
                          {formatCOP(product.price)}
                        </p>
                        <p className="font-display text-base font-bold tabular-nums text-neutral-400 line-through sm:text-lg lg:text-xl">
                          {formatCOP(product.originalPrice)}
                        </p>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white lg:text-xs">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                        </span>
                        <span className="text-[11px] font-bold text-red-600 lg:text-sm">
                          Ahorras {formatCOP(product.originalPrice - product.price)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1.5 font-display text-2xl font-bold tabular-nums sm:text-3xl lg:text-4xl">
                      {formatCOP(product.price)}
                    </p>
                  )}

                  {product.outOfStock && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 ring-1 ring-red-200">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-xs font-bold uppercase text-red-600">Agotado</span>
                    </div>
                  )}

                  {product.description && (
                    <p className="mt-3 text-sm leading-relaxed text-neutral-500 sm:mt-4 lg:text-base">
                      {product.description}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-5 sm:mt-6"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 lg:text-xs">
                    Tallas disponibles
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2 sm:mt-3 lg:gap-2.5">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => !product.outOfStock && setSize(s)}
                        disabled={!!product.outOfStock}
                        className={`min-w-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 sm:min-w-[48px] sm:py-2.5 lg:px-5 lg:py-3 lg:text-base ${
                          product.outOfStock
                            ? "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                            : size === s
                              ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20"
                              : "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200 hover:ring-neutral-400 hover:bg-neutral-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-400 lg:text-sm">
                    {size
                      ? `Talla seleccionada: ${size}`
                      : "Selecciona tu talla (opcional)"}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-5 pt-5 space-y-2.5 sm:mt-auto sm:pt-8 sm:space-y-3"
                >
                  {product.outOfStock ? (
                    <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-100 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-neutral-400 sm:py-4 lg:py-5 lg:text-base">
                      <ShoppingBag size={18} />
                      Agotado
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-wider transition-all duration-300 sm:py-4 lg:py-5 lg:text-base ${
                        added
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                          : "bg-white text-neutral-900 ring-2 ring-neutral-900 hover:bg-neutral-900 hover:text-white hover:shadow-lg hover:shadow-neutral-900/20"
                      }`}
                    >
                      {added ? (
                        <>
                          <Check size={18} />
                          Agregado al carrito
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={18} />
                          Agregar al carrito
                        </>
                      )}
                    </button>
                  )}
                  <a
                    href={waLink(site, message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-wider transition-all duration-300 sm:py-4 lg:py-5 lg:text-base ${
                      product.outOfStock
                        ? "bg-neutral-200 text-neutral-500 pointer-events-none"
                        : "bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20"
                    }`}
                  >
                    Pedir por WhatsApp
                    <ArrowUpRight size={18} />
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

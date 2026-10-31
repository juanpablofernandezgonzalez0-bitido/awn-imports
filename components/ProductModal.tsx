"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Share2,
  ZoomIn,
  ArrowRight,
  Truck,
  ShieldCheck,
  BadgeCheck,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react";
import type { Product } from "@/lib/products";
import { formatCOP, formatPrice, waLink, type SiteConfig } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { OPEN_CART_EVENT, productHash } from "@/lib/events";

const featureIcons: Record<string, LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  badge: BadgeCheck,
  refresh: RefreshCcw,
};

const EASE = [0.22, 1, 0.36, 1] as const;

function getAllImages(product: Product): string[] {
  if (product.images && product.images.length > 0) return product.images;
  if (product.image) return [product.image];
  return [];
}

function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className: string;
}) {
  if (src.startsWith("data:")) {
    return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "60%" : "-60%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0 }),
};

export default function ProductModal({
  product,
  site,
  onClose,
}: {
  product: Product | null;
  site: SiteConfig;
  onClose: () => void;
}) {
  const titleId = useId();
  const { addItem } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(0);
  const [shared, setShared] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const imgs = product ? getAllImages(product) : [];
  const count = imgs.length;
  const soldOut = !!product?.outOfStock;
  const hasDiscount = !!(product?.originalPrice && product.originalPrice > product.price);
  const showCategory = product && product.category && product.category.toLowerCase() !== "sin categoria";

  useEffect(() => {
    setSize(null);
    setIndex(0);
    setDirection(0);
    setZoom(null);
    setAdded(false);
    setSizeError(0);
    setShared(false);
  }, [product?.id]);

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setZoom(null);
      setDirection(delta);
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  const goTo = (i: number) => {
    if (i === index) return;
    setZoom(null);
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  // Teclado, bloqueo de scroll y foco inicial.
  useEffect(() => {
    if (!product) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoom) setZoom(null);
        else onClose();
      }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose, go, zoom]);

  if (!product) {
    return <AnimatePresence />;
  }

  const priceText = product.price > 0 ? ` (${formatCOP(product.price)})` : "";
  const orderMessage = soldOut
    ? `Hola AWN IMPORT 👋, me interesa la prenda "${product.name}". ¿Me avisan cuando vuelva a estar disponible?`
    : `Hola AWN IMPORT 👋, me interesa la prenda "${product.name}"${priceText}${size ? ` en talla ${size}` : ""}.`;
  const sizeHelpMessage = `Hola AWN IMPORT 👋, tengo una duda de talla con la prenda "${product.name}". ¿Me pueden asesorar?`;

  const handleAddToCart = () => {
    if (soldOut) return;
    if (product.sizes.length > 0 && !size) {
      setSizeError((n) => n + 1);
      return;
    }
    addItem(product, size);
    setAdded(true);
  };

  const openCart = () => {
    onClose();
    window.setTimeout(() => window.dispatchEvent(new Event(OPEN_CART_EVENT)), 250);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${productHash(product.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${product.name} · ${site.name}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      // El usuario canceló el diálogo de compartir.
    }
  };

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const toggleZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    // El zoom solo aplica con puntero fino (escritorio); en móvil se navega con swipe.
    if (!window.matchMedia("(pointer: fine)").matches || count === 0) return;
    if (zoom) return setZoom(null);
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const features = (site.features ?? []).slice(0, 3);

  return (
    <AnimatePresence>
      <motion.div
        key="product-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6"
      >
        <button
          aria-label="Cerrar"
          tabIndex={-1}
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-neutral-950/60 backdrop-blur-md"
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl md:h-[88dvh] md:max-h-[820px] md:max-w-6xl md:flex-row md:rounded-3xl"
        >
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 md:right-4 md:top-4"
          >
            <X size={18} />
          </button>

          {/* En móvil todo el contenido hace scroll; en escritorio cada columna tiene su propio scroll. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain md:flex-row md:overflow-hidden">
            {/* ── Galería ── */}
            <div className="relative shrink-0 bg-neutral-100 md:flex md:w-[56%] md:flex-col">
              <div
                className={`relative aspect-[4/5] w-full touch-pan-y select-none overflow-hidden md:aspect-auto md:min-h-0 md:flex-1 ${
                  count > 0 ? (zoom ? "md:cursor-zoom-out" : "md:cursor-zoom-in") : ""
                }`}
                onClick={toggleZoom}
                onMouseMove={handleZoomMove}
                onMouseLeave={() => setZoom(null)}
                onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
                onTouchEnd={(e) => {
                  if (touchStartX.current === null) return;
                  const delta = e.changedTouches[0].clientX - touchStartX.current;
                  if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
                  touchStartX.current = null;
                }}
              >
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={`${product.id}-${index}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-0"
                  >
                    {count > 0 ? (
                      <div
                        className="absolute inset-0 transition-transform duration-300 ease-out"
                        style={{
                          transform: zoom ? "scale(2.2)" : "scale(1)",
                          transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "center",
                        }}
                      >
                        <ProductImage
                          src={imgs[index]}
                          alt={`${product.name}, foto ${index + 1} de ${count}`}
                          sizes="(min-width: 1280px) 720px, (min-width: 768px) 56vw, 100vw"
                          priority
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">Sin foto</span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Etiquetas sobre la foto */}
                <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-1.5 md:left-5 md:top-5">
                  {product.tag && (
                    <span className="rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white md:text-xs">
                      {product.tag}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white md:text-xs">
                      -{Math.round((1 - product.price / product.originalPrice!) * 100)}%
                    </span>
                  )}
                </div>

                {count > 1 && (
                  <>
                    <span className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-md md:bottom-5 md:left-5">
                      {index + 1} / {count}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        go(-1);
                      }}
                      aria-label="Foto anterior"
                      className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition hover:scale-105 hover:bg-white md:flex"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        go(1);
                      }}
                      aria-label="Foto siguiente"
                      className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition hover:scale-105 hover:bg-white md:flex"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {count > 0 && !zoom && (
                  <span className="pointer-events-none absolute bottom-5 right-5 z-20 hidden items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md md:inline-flex">
                    <ZoomIn size={13} />
                    Clic para ampliar
                  </span>
                )}
              </div>

              {/* Miniaturas */}
              {count > 1 && (
                <div className="flex gap-2 overflow-x-auto bg-white px-4 py-3 md:bg-neutral-100 md:px-5 md:pb-5 md:pt-0">
                  {imgs.map((src, i) => (
                    <button
                      key={src + i}
                      onClick={() => goTo(i)}
                      aria-label={`Ver foto ${i + 1}`}
                      aria-current={i === index}
                      className={`relative h-16 w-[3.25rem] shrink-0 overflow-hidden rounded-lg bg-neutral-100 transition md:h-20 md:w-16 ${
                        i === index
                          ? "ring-2 ring-neutral-900 ring-offset-2 ring-offset-white md:ring-offset-neutral-100"
                          : "opacity-60 ring-1 ring-neutral-200 hover:opacity-100"
                      }`}
                    >
                      <ProductImage src={src} alt="" sizes="64px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Información ── */}
            <div className="flex flex-col md:min-h-0 md:flex-1 md:overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
                className="flex-1 px-5 pb-6 pt-6 md:px-10 md:pt-14"
              >
                {showCategory && (
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                    {product.category}
                  </p>
                )}
                <h2
                  id={titleId}
                  className="mt-1.5 pr-10 font-display text-2xl font-bold uppercase leading-tight tracking-tight md:pr-0 md:text-4xl"
                >
                  {product.name}
                </h2>

                <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {hasDiscount ? (
                    <>
                      <span className="font-display text-3xl font-bold tabular-nums text-red-600">
                        {formatCOP(product.price)}
                      </span>
                      <span className="font-display text-lg font-bold tabular-nums text-neutral-400 line-through">
                        {formatCOP(product.originalPrice!)}
                      </span>
                      <span className="text-xs font-bold text-red-600">
                        Ahorras {formatCOP(product.originalPrice! - product.price)}
                      </span>
                    </>
                  ) : (
                    <span
                      className={`font-display font-bold tabular-nums ${
                        product.price > 0 ? "text-3xl text-neutral-900" : "text-xl text-neutral-500"
                      }`}
                    >
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold">
                  <span className={`h-2 w-2 rounded-full ${soldOut ? "bg-red-500" : "bg-emerald-500"}`} />
                  <span className={soldOut ? "text-red-600" : "text-emerald-700"}>
                    {soldOut ? "Agotado por ahora" : "Disponible · Envío a todo el país"}
                  </span>
                </div>

                {product.description && (
                  <p className="mt-5 text-sm leading-relaxed text-neutral-600 md:text-base">
                    {product.description}
                  </p>
                )}

                {product.sizes.length > 0 && (
                  <div className="mt-7 border-t border-neutral-100 pt-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-900">
                        Talla{size && <span className="ml-2 font-semibold normal-case tracking-normal text-neutral-500">{size}</span>}
                      </p>
                      <a
                        href={waLink(site, sizeHelpMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900 hover:decoration-neutral-900"
                      >
                        ¿Dudas con tu talla?
                      </a>
                    </div>

                    <motion.div
                      key={sizeError}
                      animate={sizeError ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      role="radiogroup"
                      aria-label="Elige tu talla"
                      className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5"
                    >
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          role="radio"
                          aria-checked={size === s}
                          disabled={soldOut}
                          onClick={() => {
                            setSize(s);
                            setSizeError(0);
                            setAdded(false);
                          }}
                          className={`h-12 rounded-xl text-sm font-bold transition-all duration-200 ${
                            soldOut
                              ? "cursor-not-allowed bg-neutral-50 text-neutral-300 line-through"
                              : size === s
                                ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20"
                                : sizeError
                                  ? "bg-white text-neutral-700 ring-1 ring-red-300 hover:ring-neutral-900"
                                  : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-neutral-900"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>

                    <AnimatePresence>
                      {sizeError > 0 && !size && (
                        <motion.p
                          role="alert"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 text-xs font-semibold text-red-600"
                        >
                          Elige una talla para agregar la prenda al carrito.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {features.length > 0 && (
                  <ul className="mt-7 space-y-3 rounded-2xl bg-neutral-50 p-4 md:p-5">
                    {features.map((f) => {
                      const Icon = featureIcons[f.icon] ?? Truck;
                      return (
                        <li key={f.title} className="flex items-start gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-neutral-200">
                            <Icon size={15} className="text-neutral-700" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-900">{f.title}</p>
                            {f.text && <p className="text-xs leading-relaxed text-neutral-500">{f.text}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <button
                  onClick={handleShare}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-neutral-900"
                >
                  {shared ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                  {shared ? "Enlace copiado" : "Compartir esta prenda"}
                </button>
              </motion.div>

              {/* Acciones fijas al pie */}
              <div className="sticky bottom-0 z-10 border-t border-neutral-200 bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:px-10 md:pb-6 md:pt-4">
                <AnimatePresence>
                  {added && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-2.5 ring-1 ring-emerald-200">
                        <span className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                          <Check size={15} />
                          Agregado al carrito{size ? ` · Talla ${size}` : ""}
                        </span>
                        <button
                          onClick={openCart}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 underline-offset-4 hover:underline"
                        >
                          Ver carrito
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    disabled={soldOut}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 text-sm font-bold text-white transition hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none md:h-14"
                  >
                    <ShoppingBag size={17} />
                    {soldOut ? "Agotado" : (
                      <>
                        <span className="sm:hidden">Agregar</span>
                        <span className="hidden sm:inline">Agregar al carrito</span>
                      </>
                    )}
                  </button>
                  <a
                    href={waLink(site, orderMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-bold text-white transition hover:bg-[#1ebe5b] hover:shadow-lg hover:shadow-[#25D366]/25 md:h-14"
                  >
                    {soldOut ? (
                      <>
                        <span className="sm:hidden">Avísame</span>
                        <span className="hidden sm:inline">Avísame cuando llegue</span>
                      </>
                    ) : (
                      <>
                        <span className="sm:hidden">WhatsApp</span>
                        <span className="hidden sm:inline">Pedir por WhatsApp</span>
                      </>
                    )}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

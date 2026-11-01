"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { formatPrice, waLink, type SiteConfig } from "@/lib/site";
import type { Product } from "@/lib/products";
import { productHash } from "@/lib/events";

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_SPOT = 5;
const INTERVAL = 5500;

const wordReveal = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: 0,
    transition: { duration: 0.9, delay: 0.25 + i * 0.09, ease: EASE },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.85 + i * 0.12, ease: EASE },
  }),
};

function RevealWords({ text, offset, className }: { text: string; offset: number; className?: string }) {
  return (
    <>
      {text
        .split(/\s+/)
        .filter(Boolean)
        .map((word, i) => (
          <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-[0.06em] align-bottom">
            <motion.span custom={offset + i} variants={wordReveal} initial="hidden" animate="visible" className={`inline-block ${className ?? ""}`}>
              {word}
            </motion.span>
          </span>
        ))}
    </>
  );
}

function Pic({ src, className, priority }: { src: string; className: string; priority?: boolean }) {
  return src.startsWith("data:") ? (
    <img src={src} alt="" className={`absolute inset-0 h-full w-full ${className}`} />
  ) : (
    <Image src={src} alt="" fill sizes="(min-width: 1024px) 480px, 90vw" className={className} priority={priority} />
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Prenda destacada colgada en una barra, que va rotando como en un probador. */
function Spotlight({ products }: { products: Product[] }) {
  const items = products.slice(0, MAX_SPOT);
  const n = items.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const touchX = useRef<number | null>(null);
  const p = items[index % n];
  const front = p.images?.[0] ?? p.image ?? "";
  const back = p.images?.[1];
  const go = (d: number) => setIndex((i) => (i + d + n) % n);
  const category = p.category && p.category !== "Sin categoria" ? p.category : "AWN IMPORT";

  return (
    <div
      className="relative mx-auto mt-6 w-full max-w-[26rem] lg:mt-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {/* Barra */}
      <div className="absolute -inset-x-6 top-0 z-10 h-[3px] rounded-full bg-gradient-to-r from-transparent via-white/45 to-transparent" />

      <div className="relative h-[310px] sm:h-[440px] lg:h-[520px]">
        <AnimatePresence initial={false}>
          <motion.a
            key={p.id}
            href={productHash(p.id)}
            aria-label={`Ver ${p.name}`}
            className="group absolute inset-0 block outline-none"
            style={{ transformOrigin: "50% 0" }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 70, rotate: 4 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -70, rotate: -4 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <div className="spot-sway relative h-full w-full">
              {p.hanger ? (
                <div className="absolute inset-0 drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]">
                  <Pic src={front} priority className={`object-contain object-top transition-opacity duration-700 ${back ? "group-hover:opacity-0" : ""}`} />
                  {back && <Pic src={back} className="object-contain object-top opacity-0 transition-opacity duration-700 group-hover:opacity-100" />}
                </div>
              ) : (
                <>
                  <svg viewBox="0 0 200 52" className="absolute left-1/2 top-0 w-[56%] -translate-x-1/2 text-white/50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M100 1c-7 0-10 5-9 9s9 6 9 13" />
                    <path d="M100 23 8 50h184z" />
                  </svg>
                  <div className="absolute inset-x-[12%] bottom-0 top-[13%] overflow-hidden rounded-2xl bg-neutral-800 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
                    <Pic src={front} priority className={`object-cover transition-[opacity,transform] duration-700 group-hover:scale-[1.03] ${back ? "group-hover:opacity-0" : ""}`} />
                    {back && <Pic src={back} className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />}
                  </div>
                </>
              )}
            </div>
          </motion.a>
        </AnimatePresence>
      </div>

      {/* Ficha */}
      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/35">
            {pad(index + 1)} / {pad(n)} — {category}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <p className="mt-2 truncate font-display text-lg font-semibold uppercase tracking-tight sm:text-xl">{p.name}</p>
              <p className="mt-0.5 text-[13px] text-white/50">{formatPrice(p.price)}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <a
          href={productHash(p.id)}
          className="shrink-0 text-[12px] font-medium uppercase tracking-wider text-white/60 underline decoration-white/20 underline-offset-8 transition hover:text-white hover:decoration-white"
        >
          Ver prenda
        </a>
      </div>

      {/* Progreso */}
      {n > 1 && (
        <div className="mt-3 flex gap-1.5">
          {items.map((it, i) => (
            <button key={it.id} type="button" onClick={() => setIndex(i)} aria-label={`Mostrar ${it.name}`} aria-current={i === index} className="group/bar flex h-6 flex-1 items-center">
              <span className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/15 transition group-hover/bar:bg-white/30">
                {i < index && <span className="absolute inset-0 bg-white/70" />}
                {i === index &&
                  (reduce ? (
                    <span className="absolute inset-0 bg-white" />
                  ) : (
                    <span
                      key={index}
                      className="spot-fill absolute inset-0 origin-left bg-white"
                      style={{ animationDuration: `${INTERVAL}ms`, animationPlayState: paused ? "paused" : "running" }}
                      onAnimationEnd={() => go(1)}
                    />
                  ))}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Hero({ site, products = [] }: { site: SiteConfig; products?: Product[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const yStage = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Primero las prendas fotografiadas en gancho: lucen mejor colgadas en la barra.
  const featured = useMemo(
    () => products.filter((p) => p.images?.[0] || p.image).sort((a, b) => Number(!!b.hanger) - Number(!!a.hanger)),
    [products],
  );

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-neutral-950 pb-20 pt-28 text-white sm:pt-36 lg:pb-12"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
        {/* Texto */}
        <motion.div style={{ y: yText, opacity: fade }} className="relative z-10 order-2 lg:order-none">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/40"
          >
            {site.name} — {site.tagline}
          </motion.p>

          <h1 className="mt-6 font-display text-[11vw] font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-[4.25rem] xl:text-[4.75rem]">
            <RevealWords text={site.heroTitle} offset={0} />
            <br />
            <RevealWords text={site.heroLine2} offset={2} className="text-white/35" />
            <br />
            <RevealWords text={`tu ${site.heroHighlight}`} offset={4} />
          </h1>

          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/50"
          >
            {site.heroSubtitle}
          </motion.p>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mt-10 flex items-center gap-8">
            <a
              href="#catalogo"
              className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-7 text-[13px] font-semibold uppercase tracking-wider text-neutral-950 transition hover:bg-neutral-200"
            >
              {site.ctaLabel}
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href={waLink(site)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium uppercase tracking-wider text-white/60 underline decoration-white/20 underline-offset-8 transition hover:text-white hover:decoration-white"
            >
              WhatsApp
            </a>
          </motion.div>
        </motion.div>

        {/* Prenda destacada */}
        <motion.div
          style={{ y: yStage }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
          className="relative order-1 lg:order-none"
        >
          {featured.length > 0 ? (
            <Spotlight products={featured} />
          ) : (
            <div className="mx-auto flex aspect-square max-w-xs items-center justify-center rounded-3xl bg-white p-6">
              <Image src="/logo.png" alt={site.name} width={420} height={420} priority className="h-auto w-full object-contain" />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

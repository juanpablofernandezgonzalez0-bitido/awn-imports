"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { waLink, type SiteConfig } from "@/lib/site";
import type { Product } from "@/lib/products";
import { productHash } from "@/lib/events";

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_RING = 10;

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

/** Vitrina giratoria 3D con las prendas reales del catálogo. */
function Showcase({ products }: { products: Product[] }) {
  const items = products.slice(0, MAX_RING);
  const n = items.length;
  // Radio del anillo en función del ancho de tarjeta: w / (2·tan(π/n)) + separación.
  const factor = 1 / (2 * Math.tan(Math.PI / n));

  return (
    <div
      className="hero-stage relative mx-auto flex h-[290px] w-full items-center justify-center [--w:108px] sm:h-[420px] sm:[--w:150px] lg:h-[560px] lg:[--w:178px]"
      style={{ perspective: "1600px" }}
    >
      {/* Foco de luz y piso */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,255,255,0.10),transparent)]" />
      <div className="pointer-events-none absolute bottom-[6%] left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-2xl" />

      <div className="hero-ring relative" style={{ width: "var(--w)", height: "calc(var(--w) * 4 / 3)" }}>
        {items.map((p, i) => {
          const angle = (360 / n) * i;
          const src = p.images?.[0] ?? p.image;
          return (
            <a
              key={p.id}
              href={productHash(p.id)}
              aria-label={`Ver ${p.name}`}
              className="hero-card group absolute inset-0"
              style={{ transform: `rotateY(${angle}deg) translateZ(calc(var(--w) * ${factor.toFixed(4)} + 18px))` }}
            >
              {/* Frente: foto */}
              <span className="hero-face absolute inset-0 overflow-hidden rounded-xl bg-neutral-800 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-[1.04] group-focus-visible:ring-2 group-focus-visible:ring-white">
                {src?.startsWith("data:") ? (
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : src ? (
                  <Image src={src} alt="" fill sizes="180px" className="object-cover" priority={i < 4} />
                ) : null}
                <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/5" />
              </span>
              {/* Reverso: placa de marca */}
              <span className="hero-face hero-face-back absolute inset-0 flex items-center justify-center rounded-xl bg-neutral-900 ring-1 ring-white/10">
                <span className="font-display text-xl font-bold uppercase tracking-tight text-white/15">AWN</span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function Hero({ site, products = [] }: { site: SiteConfig; products?: Product[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const yStage = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const ringProducts = useMemo(() => products.filter((p) => p.images?.[0] || p.image), [products]);
  const hasRing = ringProducts.length >= 4;
  const count = products.length;

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-neutral-950 pb-16 pt-28 text-white sm:pt-36 lg:pb-10"
    >
      {/* Fondo: marca de agua, retícula y viñeta */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <motion.span
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: EASE }}
          className="absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[38vw] font-bold uppercase leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.06)] lg:text-[26vw]"
        >
          AWN
        </motion.span>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-950 to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-8">
        {/* Texto */}
        <motion.div style={{ y: yText, opacity: fade }} className="relative z-10 order-2 lg:order-none">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 sm:text-[11px]">
              {site.tagline} · Nueva temporada
            </span>
          </motion.div>

          <h1 className="mt-5 font-display text-[13vw] font-bold uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-[5.4rem] xl:text-[6.2rem]">
            <RevealWords text={site.heroTitle} offset={0} />
            <br />
            <RevealWords text={site.heroLine2} offset={2} className="text-white/55" />
            <br />
            <RevealWords text="tu" offset={4} />
            <RevealWords
              text={site.heroHighlight}
              offset={5}
              className="bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text pr-[0.12em] italic text-transparent"
            />
          </h1>

          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-7 max-w-md text-base leading-relaxed text-white/60 sm:text-lg"
          >
            {site.heroSubtitle}
          </motion.p>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#catalogo"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-white pl-7 pr-2 text-sm font-bold uppercase tracking-wider text-neutral-950 transition hover:bg-neutral-200"
            >
              {site.ctaLabel}
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight size={17} />
              </span>
            </a>
            <a
              href={waLink(site)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 px-7 text-sm font-bold uppercase tracking-wider text-white transition hover:border-white/50 hover:bg-white/5"
            >
              Pedir por WhatsApp
            </a>
          </motion.div>

          <motion.dl
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-10 grid max-w-md grid-cols-3 lg:mt-12 divide-x divide-white/10 border-t border-white/10 pt-6"
          >
            {[
              { value: count > 0 ? `${count}` : "—", label: "Prendas en catálogo" },
              { value: "Directo", label: "Importación directa" },
              { value: "COL", label: "Envíos a todo el país" },
            ].map((s, i) => (
              <div key={s.label} className={i === 0 ? "pr-4" : "px-4"}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-bold tabular-nums sm:text-3xl">{s.value}</dd>
                <dd className="mt-1 text-[10px] font-medium uppercase leading-snug tracking-wider text-white/45 sm:text-[11px]">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Vitrina */}
        <motion.div
          style={{ y: yStage }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
          className="relative order-1 -mt-4 lg:order-none lg:mt-0"
        >
          {hasRing ? (
            <>
              <Showcase products={ringProducts} />
              <p className="-mt-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/35 lg:mt-1">
                Toca una prenda para verla
              </p>
            </>
          ) : (
            <div className="mx-auto flex aspect-square max-w-sm items-center justify-center rounded-[2.5rem] bg-white p-6 shadow-2xl shadow-black/50">
              <Image src="/logo.png" alt={site.name} width={420} height={420} priority className="h-auto w-full object-contain" />
            </div>
          )}
        </motion.div>
      </div>

      <motion.a
        href="#catalogo"
        style={{ opacity: fade }}
        aria-label="Bajar al catálogo"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/40 transition hover:text-white sm:flex"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Explorar</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown size={16} />
        </motion.span>
      </motion.a>
    </section>
  );
}

"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { waLink, type SiteConfig } from "@/lib/site";
import type { Product } from "@/lib/products";
import { productHash } from "@/lib/events";

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_RING = 8;

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
      className="hero-stage relative mx-auto flex h-[250px] w-full items-center justify-center [--w:100px] sm:h-[400px] sm:[--w:140px] lg:h-[520px] lg:[--w:160px]"
      style={{ perspective: "1600px" }}
    >
      <div className="pointer-events-none absolute bottom-[8%] left-1/2 h-8 w-[60%] -translate-x-1/2 rounded-[50%] bg-black blur-2xl" />

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
              <span className={`hero-face absolute inset-0 overflow-hidden rounded-lg ${p.hanger ? "bg-neutral-200" : "bg-neutral-800"} transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:ring-2 group-focus-visible:ring-white`}>
                {src?.startsWith("data:") ? (
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : src ? (
                  <Image src={src} alt="" fill sizes="180px" className={p.hanger ? "object-contain object-top p-2" : "object-cover"} priority={i < 4} />
                ) : null}
              </span>
              {/* Reverso: placa de marca */}
              <span className="hero-face hero-face-back absolute inset-0 rounded-lg bg-neutral-900" />
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

        {/* Vitrina */}
        <motion.div
          style={{ y: yStage }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
          className="relative order-1 lg:order-none"
        >
          {hasRing ? (
            <Showcase products={ringProducts} />
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

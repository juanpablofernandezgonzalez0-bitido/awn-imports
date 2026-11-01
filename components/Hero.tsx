"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { waLink, type SiteConfig } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

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

export default function Hero({ site }: { site: SiteConfig }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const yStage = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

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

        {/* Logo */}
        <motion.div
          style={{ y: yStage }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
          className="relative order-1 lg:order-none"
        >
          <div className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[28rem] lg:max-w-[34rem]">
            {/* Halo suave detrás del logo */}
            <div className="pointer-events-none absolute inset-[12%] rounded-full bg-white/[0.06] blur-3xl" />
            <Image
              src="/logo.png"
              alt={site.name}
              fill
              priority
              sizes="(min-width: 1024px) 544px, (min-width: 640px) 448px, 352px"
              className="hero-logo object-contain"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

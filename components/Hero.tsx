"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { SiteConfig } from "@/lib/site";

const wordReveal = {
  hidden: { y: "110%", rotateX: -40 },
  visible: (i: number) => ({
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.9,
      delay: 0.3 + i * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.9 + i * 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function Hero({ site }: { site: SiteConfig }) {
  const words = (text: string) => text.split(/\s+/).filter(Boolean);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const yLogo = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const smoothYLogo = useSpring(yLogo, { stiffness: 50, damping: 20 });
  const smoothScale = useSpring(scale, { stiffness: 50, damping: 20 });


  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="grid-pattern relative flex min-h-screen items-center overflow-hidden pt-32 sm:pt-36"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 via-transparent to-white pointer-events-none" />

      <motion.div
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} className="text-neutral-400" />
        </motion.div>
      </motion.div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
        <motion.div
          style={{ y: yText, scale: smoothScale }}
          className="relative z-10"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 h-[2px] bg-neutral-900"
          />

          <h1 className="font-display text-4xl font-bold uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            {words(site.heroTitle).map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
                <motion.span
                  custom={i}
                  variants={wordReveal}
                  initial="hidden"
                  animate="visible"
                  className="inline-block"
                  style={{ transformOrigin: "bottom" }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
            <br />
            {words(site.heroLine2).map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
                <motion.span
                  custom={i + 3}
                  variants={wordReveal}
                  initial="hidden"
                  animate="visible"
                  className="inline-block"
                  style={{ transformOrigin: "bottom" }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
            <br />
            <span className="inline-block overflow-hidden">
              <motion.span
                custom={6}
                variants={wordReveal}
                initial="hidden"
                animate="visible"
                className="inline-block"
              >
                tu{" "}
              </motion.span>
            </span>
            <span className="inline-block overflow-hidden">
              <motion.span
                custom={7}
                variants={wordReveal}
                initial="hidden"
                animate="visible"
                className="inline-block text-stroke"
              >
                {site.heroHighlight}
              </motion.span>
            </span>
          </h1>

          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 max-w-md text-base leading-relaxed text-neutral-500 sm:text-lg"
          >
            {site.heroSubtitle}
          </motion.p>

          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#catalogo"
              className="group inline-flex items-center gap-3 rounded-full bg-neutral-900 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20"
            >
              {site.ctaLabel}
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
            <a
              href="#nosotros"
              className="inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-bold uppercase tracking-wider text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Conocer más
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: smoothYLogo }}
          className="relative flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-neutral-100 to-neutral-200/50 blur-2xl opacity-60" />
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-[2.5rem] bg-white p-3 ring-1 ring-neutral-200/60 shadow-2xl shadow-neutral-900/10"
            >
              <Image
                src="/logo.png"
                alt="Logo AWN IMPORT"
                width={440}
                height={440}
                priority
                className="h-auto w-full max-w-[280px] rounded-[2rem] object-contain sm:max-w-[320px] lg:max-w-[420px]"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

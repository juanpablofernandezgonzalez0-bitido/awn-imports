"use client";

import { motion } from "framer-motion";
import type { SiteConfig } from "@/lib/site";
import { Truck, ShieldCheck, BadgeCheck, RefreshCcw, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  badge: BadgeCheck,
  refresh: RefreshCcw,
};

export default function About({ site }: { site: SiteConfig }) {

  return (
    <section id="nosotros" className="relative overflow-hidden bg-neutral-950 py-20 sm:py-28 lg:py-36">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.03),transparent_50%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 48 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 h-[2px] bg-white/40"
            />
            <h2 className="font-display text-3xl font-bold uppercase leading-tight tracking-tight text-white sm:text-5xl">
              {site.aboutTitle}
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-neutral-400">
              {site.aboutText}
            </p>
          </motion.div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(site.features ?? []).map((feature, i) => {
            const Icon = iconMap[feature.icon] ?? Truck;
            return (
              <motion.div
                key={feature.title + i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="group rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:ring-white/20"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition-all duration-300 group-hover:bg-white/15 group-hover:scale-110">
                  <Icon size={22} className="text-white/80" />
                </div>
                <h3 className="mt-4 font-display text-sm font-bold uppercase leading-snug text-white">
                  {feature.title}
                </h3>
                {feature.text && (
                  <p className="mt-2 text-xs leading-relaxed text-neutral-400">{feature.text}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

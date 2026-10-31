"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram, Mail, MessageCircle, Music2 } from "lucide-react";
import { waLink, type SiteConfig } from "@/lib/site";

export default function Footer({ site }: { site: SiteConfig }) {

  const socials = [
    { icon: Instagram, label: "Instagram", href: `https://instagram.com/${site.instagram}` },
    { icon: Music2, label: "TikTok", href: `https://tiktok.com/@${site.tiktok}` },
    { icon: MessageCircle, label: "WhatsApp", href: waLink(site) },
    { icon: Mail, label: "Email", href: `mailto:${site.email}` },
  ];

  return (
    <footer id="contacto" className="relative overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-center"
        >
          <div>
            <a href="#inicio" className="group inline-flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-2 rounded-2xl bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <Image
                  src="/logo.png"
                  alt={site.name}
                  width={40}
                  height={40}
                  className="relative h-10 w-10 object-contain"
                />
              </div>
              <span className="font-display text-xl font-bold uppercase tracking-tight">
                {site.name}
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-500">
              {site.footerTagline}
            </p>
          </div>

          <div className="flex gap-3">
            {socials.map((social, i) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -3, scale: 1.05 }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-neutral-400 ring-1 ring-white/10 transition-all duration-300 hover:bg-white hover:text-neutral-900 hover:ring-white hover:shadow-lg hover:shadow-white/10"
              >
                <social.icon size={18} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row"
        >
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-700">
            {site.tagline}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import CartDrawer from "./CartDrawer";
import { OPEN_CART_EVENT, OPEN_SEARCH_EVENT } from "@/lib/events";
import type { SiteConfig } from "@/lib/site";

const links = [
  { label: "Catálogo", href: "#catalogo" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

export default function Header({ site }: { site: SiteConfig }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  // Sobre la portada (oscura) el header es transparente con texto claro.
  const onDark = !scrolled && !open;

  useEffect(() => {
    const openCart = () => setCartOpen(true);
    window.addEventListener(OPEN_CART_EVENT, openCart);
    return () => window.removeEventListener(OPEN_CART_EVENT, openCart);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.85 - 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="bg-neutral-900 px-4 py-2 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/90 sm:text-[11px]"
        >
          {site.announcement}
        </motion.p>
      </div>

      <div
        className={`relative transition-[background-color,backdrop-filter,box-shadow] duration-500 ${
          onDark
            ? "bg-transparent"
            : "bg-white/90 shadow-[0_1px_0_rgba(0,0,0,0.08)] backdrop-blur-xl"
        }`}
      >

        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <a href="#inicio" aria-label="AWN IMPORT, ir al inicio" className="group flex shrink-0 items-center gap-2.5">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-neutral-900/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Image
                src="/logo.png"
                alt="AWN IMPORT"
                width={40}
                height={40}
                className={`relative h-9 w-9 object-contain transition duration-500 ${onDark ? "invert" : ""}`}
              />
            </div>
            <span className={`font-display text-lg font-bold uppercase tracking-tight transition-colors duration-500 ${onDark ? "text-white" : "text-neutral-900"}`}>
              AWN<span className={onDark ? "text-white/50" : "text-neutral-400"}> IMPORT</span>
            </span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`relative rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${onDark ? "text-white/70 hover:text-white" : "text-neutral-500 hover:text-neutral-900"}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              aria-label="Buscar prendas"
              onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
              className={`hidden h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 sm:flex ${onDark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"}`}
            >
              <Search size={17} />
            </button>
            <button
              aria-label={totalItems > 0 ? `Carrito, ${totalItems} prendas` : "Carrito"}
              onClick={() => setCartOpen(true)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${onDark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"}`}
            >
              <ShoppingBag size={17} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-bold ${onDark ? "bg-white text-neutral-900" : "bg-neutral-900 text-white"}`}
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
            <a
              href="#catalogo"
              className={`hidden rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 md:block ${onDark ? "bg-white text-neutral-900 hover:bg-neutral-200" : "bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20"}`}
            >
              {site.ctaLabel}
            </a>

            <button
              onClick={() => setOpen((v) => !v)}
              className={`rounded-xl p-2.5 transition-colors duration-300 lg:hidden ${onDark ? "text-white hover:bg-white/10" : "text-neutral-900 hover:bg-neutral-100"}`}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-b border-neutral-200 bg-white/95 backdrop-blur-xl lg:hidden"
            >
              <ul className="flex flex-col gap-1 px-6 py-4">
                {links.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest text-neutral-700 transition-colors duration-300 hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="mt-2"
                >
                  <a
                    href="#catalogo"
                    onClick={() => setOpen(false)}
                    className="block rounded-full bg-neutral-900 px-4 py-3 text-center text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-neutral-800"
                  >
                    {site.ctaLabel}
                  </a>
                </motion.li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} site={site} />
    </motion.header>
  );
}

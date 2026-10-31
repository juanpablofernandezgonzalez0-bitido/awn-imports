"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatCOP, waLink } from "@/lib/site";

export default function CartDrawer({ open, onClose, site }: { open: boolean; onClose: () => void; site: any }) {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [open, onClose]);

  const buildWhatsAppMessage = () => {
    if (items.length === 0) return "";
    const lines = items.map((i) => {
      const sizeText = i.size ? ` (Talla ${i.size})` : "";
      return `- ${i.product.name}${sizeText} x${i.quantity} — ${formatCOP(i.product.price * i.quantity)}`;
    });
    const total = formatCOP(totalPrice);
    return `Hola AWN IMPORT 👋, quiero hacer un pedido:\n\n${lines.join("\n")}\n\nTotal: ${total}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex justify-end"
        >
          <motion.button
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                Mi pedido ({totalItems})
              </h2>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
                  <ShoppingBag size={40} strokeWidth={1.5} />
                  <p className="text-sm font-bold uppercase">Tu carrito está vacío</p>
                  <p className="text-xs">Agregá prendas desde el catálogo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="flex gap-4 rounded-2xl bg-neutral-50 p-3 ring-1 ring-neutral-200"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                        {item.product.image ? (
                          item.product.image.startsWith("data:") ? (
                            <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                          ) : (
                            <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="80px" />
                          )
                        ) : null}
                      </div>

                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div>
                          <p className="truncate text-sm font-bold uppercase">{item.product.name}</p>
                          {item.size && (
                            <p className="text-[11px] text-neutral-500">Talla: {item.size}</p>
                          )}
                          <p className="text-sm font-bold">{formatCOP(item.product.price)}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-200 text-neutral-600 transition hover:bg-neutral-300"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-200 text-neutral-600 transition hover:bg-neutral-300"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id, item.size)}
                            className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-neutral-200 px-6 py-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase text-neutral-500">Total</span>
                  <span className="font-display text-xl font-bold">{formatCOP(totalPrice)}</span>
                </div>

                <a
                  href={waLink(site, buildWhatsAppMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-neutral-700"
                >
                  Pedir por WhatsApp
                </a>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-xs font-bold uppercase text-neutral-400 transition hover:text-red-500"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

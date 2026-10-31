"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Marquee({ items: serverItems }: { items: string[] }) {
  const [items, setItems] = useState(serverItems);
  const row = [...items, ...items, ...items];

  useEffect(() => {
    fetch("/api/site").then((r) => r.json()).then((s) => {
      if (s && Array.isArray(s.marquee) && s.marquee.length > 0) setItems(s.marquee);
    }).catch(() => {});
  }, []);

  return (
    <div className="relative overflow-hidden border-y border-neutral-900 bg-neutral-900 py-4">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-neutral-900 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-neutral-900 to-transparent z-10" />

      <div className="flex">
        <div className="animate-marquee flex shrink-0 items-center gap-10 whitespace-nowrap pr-10">
          {row.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-10 font-display text-base font-bold uppercase tracking-[0.25em] text-white/90"
            >
              {item}
              <span className="text-neutral-600">&#9670;</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

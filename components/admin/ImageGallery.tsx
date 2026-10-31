"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

const ALL_IMAGES = ["/ropa/IMG_0312.JPG","/ropa/IMG_0313.JPG","/ropa/IMG_0314.JPG","/ropa/IMG_0315.JPG","/ropa/IMG_0316.JPG","/ropa/IMG_0317.JPG","/ropa/IMG_0318.JPG","/ropa/IMG_0319.JPG","/ropa/IMG_0320.JPG","/ropa/IMG_0321.JPG","/ropa/IMG_0322.JPG","/ropa/IMG_0323.JPG","/ropa/IMG_0324.JPG","/ropa/IMG_0325.JPG","/ropa/IMG_0326.JPG","/ropa/IMG_0327.JPG","/ropa/IMG_0328.JPG","/ropa/IMG_0329.JPG","/ropa/IMG_0331.JPG","/ropa/IMG_0332.JPG","/ropa/IMG_0333.JPG","/ropa/IMG_0334.JPG","/ropa/IMG_0335.JPG","/ropa/IMG_0336.JPG","/ropa/IMG_0337.JPG","/ropa/IMG_0338.JPG","/ropa/IMG_0339.JPG","/ropa/IMG_0340.JPG","/ropa/IMG_0341.JPG","/ropa/IMG_0342.JPG","/ropa/IMG_0343.JPG","/ropa/IMG_0344.JPG","/ropa/IMG_0345.JPG","/ropa/IMG_0346.JPG","/ropa/IMG_0347.JPG","/ropa/IMG_0348.JPG","/ropa/IMG_0371.JPG","/ropa/IMG_0372.JPG","/ropa/IMG_0373.JPG","/ropa/IMG_0375.JPG","/ropa/IMG_0376.JPG","/ropa/IMG_0378.JPG","/ropa/IMG_0380.JPG","/ropa/IMG_0382.JPG","/ropa/IMG_0384.JPG","/ropa/IMG_0385.JPG","/ropa/IMG_0386.JPG","/ropa/IMG_0387.JPG","/ropa/IMG_0388.JPG","/ropa/IMG_0389.JPG","/ropa/IMG_0390.JPG","/ropa/IMG_0391.JPG","/ropa/IMG_0392.JPG","/ropa/IMG_0393.JPG","/ropa/product-1.jpeg","/ropa/product-2.jpeg","/ropa/product-3.jpeg","/ropa/product-4.jpeg"];

export default function ImageGallery({ current, onSelect }: { current: string; onSelect: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? ALL_IMAGES.filter((src) => src.toLowerCase().includes(filter.toLowerCase()))
    : ALL_IMAGES;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-bold uppercase text-neutral-600 transition hover:bg-neutral-200"
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {open ? "Cerrar galeria" : `Galeria (${ALL_IMAGES.length} fotos)`}
      </button>
      {open && (
        <div className="mt-3 rounded-2xl border border-neutral-200 p-3">
          <input
            type="text"
            placeholder="Buscar foto..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mb-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-neutral-900"
          />
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-4 max-h-80 overflow-y-auto">
            {filtered.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => { onSelect(src); setOpen(false); setFilter(""); }}
                className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition ${current === src ? "ring-neutral-900" : "ring-transparent hover:ring-neutral-400"}`}
              >
                <Image src={src} alt={src} fill className="object-cover" sizes="80px" />
                {current === src && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><span className="text-[8px] font-bold text-white">OK</span></div>}
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] text-neutral-400">{filtered.length} fotos</p>
        </div>
      )}
    </div>
  );
}
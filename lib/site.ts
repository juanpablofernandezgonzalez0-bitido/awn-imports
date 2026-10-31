export type SiteConfig = {
  name: string;
  tagline: string;
  announcement: string;
  heroTitle: string;
  heroLine2: string;
  heroHighlight: string;
  heroSubtitle: string;
  ctaLabel: string;
  aboutTitle: string;
  aboutText: string;
  footerTagline: string;
  whatsapp: string;
  whatsappMessage: string;
  instagram: string;
  tiktok: string;
  email: string;
  marquee: string[];
  features: { icon: string; title: string; text: string }[];
};

export const site: SiteConfig = {
  name: "AWN IMPORT",
  tagline: "Moda Urbana Premium",
  announcement: "Envíos a todo el país • Nueva temporada disponible • Import directo",
  heroTitle: "Moda urbana",
  heroLine2: "que define",
  heroHighlight: "actitud",
  heroSubtitle:
    "Prendas urbanas premium importadas para quienes viven la calle.",
  ctaLabel: "Ver catálogo",
  aboutTitle: "Más que ropa, una identidad",
  aboutText:
    "En AWN IMPORT importamos prendas urbanas premium seleccionadas por calidad y diseño. Viste la actitud que defines.",
  footerTagline: "Moda urbana premium. Import directo.",
  whatsapp: "5491100000000",
  whatsappMessage:
    "Hola AWN IMPORT 👋, quiero hacer un pedido de una prenda de su catálogo.",
  instagram: "awn.import",
  tiktok: "awn.import",
  email: "contacto@awnimport.com",
  marquee: [
    "AWN IMPORT",
    "Moda Urbana",
    "Estilo Urbano",
    "Calidad Premium",
    "Nueva Temporada",
    "Import Directo",
  ],
  features: [
    { icon: "truck", title: "Envíos rápidos", text: "Despachos a todo el país con seguimiento." },
    { icon: "shield", title: "Pago seguro", text: "Compra protegida y varios métodos de pago." },
    { icon: "badge", title: "Calidad premium", text: "Prendas importadas seleccionadas una a una." },
    { icon: "refresh", title: "Stock constante", text: "Mercancía nueva cada semana." },
  ],
};

export function waLink(cfg: SiteConfig, message?: string) {
  const text = encodeURIComponent(message ?? cfg.whatsappMessage);
  return `https://wa.me/${cfg.whatsapp}?text=${text}`;
}

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(amount: number) {
  return copFormatter.format(amount);
}
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const description =
  "AWN IMPORT: prendas premium importadas, seleccionadas por calidad y diseño. Envíos a todo el país y pedidos por WhatsApp.";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AWN IMPORT — Moda Premium Importada",
    template: "%s · AWN IMPORT",
  },
  description,
  applicationName: "AWN IMPORT",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "AWN IMPORT",
    title: "AWN IMPORT — Moda Premium Importada",
    description,
    images: [{ url: "/logo.png", alt: "AWN IMPORT" }],
  },
  twitter: { card: "summary", title: "AWN IMPORT", description },
};

export const viewport: Viewport = {
  themeColor: "#171717",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
import { getSite, getProducts } from "@/lib/store";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Catalog from "@/components/Catalog";
import About from "@/components/About";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [site, products] = await Promise.all([getSite(), getProducts()]);

  return (
    <main className="min-h-screen">
      <Header site={site} />
      <Hero site={site} products={products} />
      <Marquee items={site.marquee} />
      <Catalog products={products} site={site} />
      <About site={site} />
      <Footer site={site} />
      <WhatsAppButton site={site} />
    </main>
  );
}
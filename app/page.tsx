import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import ComingSoonHMD from "@/components/home/ComingSoonHMD";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CraftsmanshipSection from "@/components/home/CraftsmanshipSection";
import RussianHeritage from "@/components/home/RussianHeritage";
import CTASection from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Ana Sayfa",
  description: "Aychookah - Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları. Kalite ve geleneksel zanaatın profesyonel buluşması.",
};

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <ComingSoonHMD />
      <FeaturedProducts />
      <CraftsmanshipSection />
      <RussianHeritage />
      <CTASection />
    </>
  );
};

export default HomePage;


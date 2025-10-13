import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import Craftsmanship from "@/components/about/Craftsmanship";
import RussianConnection from "@/components/about/RussianConnection";
import Values from "@/components/about/Values";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Aychookah'ın hikayesi, el işçiliği felsefemiz ve Rus nargile kültürüyle olan derin bağımız. Geleneksel zanaatı modern tasarımla buluşturuyoruz.",
  keywords: ["nargile üretimi", "el yapımı nargile", "rus nargile kültürü", "nargile zanaatı", "lüks nargile üretici"],
};

const AboutPage: React.FC = () => {
  return (
    <>
      <AboutHero />
      <OurStory />
      <Craftsmanship />
      <RussianConnection />
      <Values />
    </>
  );
};

export default AboutPage;


import type { Metadata } from "next";
import ProductsGrid from "@/components/products/ProductsGrid";
import ProductsHero from "@/components/products/ProductsHero";

export const metadata: Metadata = {
  title: "Ürünler",
  description: "Aychookah lüks nargile takımları, orijinal Rus nargile ekipmanları ve premium aksesuarlar. El işçiliği ve kaliteli tasarımlar.",
  keywords: ["nargile satış", "rus nargile takımı", "lüks nargile", "nargile aksesuarları", "premium nargile"],
};

const ProductsPage: React.FC = () => {
  return (
    <>
      <ProductsHero />
      <ProductsGrid />
    </>
  );
};

export default ProductsPage;


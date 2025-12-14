import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import FeaturedProductsManager from "@/components/admin/FeaturedProductsManager";
import { getFeaturedProductsForSelection, getRecentProductsForSelection } from "@/lib/actions/admin/featured-products";

export default async function FeaturedProductsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/giris?error=admin_required");
  }

  // Seçili öne çıkan ürünleri ve son 20 ürünü paralel olarak getir
  const [featuredProducts, recentProducts] = await Promise.all([
    getFeaturedProductsForSelection(),
    getRecentProductsForSelection(20),
  ]);

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Öne Çıkan Ürünler</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Ana sayfada gösterilecek öne çıkan ürünleri seçin (Maksimum 8 ürün)
        </p>
      </div>

      <FeaturedProductsManager 
        initialFeaturedProducts={featuredProducts}
        initialRecentProducts={recentProducts}
      />
    </div>
  );
}


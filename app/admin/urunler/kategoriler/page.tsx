import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCategoriesForAdmin } from "@/lib/actions/admin/categories";
import CategoriesTable from "@/components/admin/CategoriesTable";

export default async function CategoriesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/giris?error=admin_required");
  }

  const categories = await getCategoriesForAdmin();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-sans font-semibold text-gray-800">Kategoriler</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <CategoriesTable categories={categories} />
      </div>
    </div>
  );
}


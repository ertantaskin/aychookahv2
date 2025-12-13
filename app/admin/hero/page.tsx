import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import HeroManager from "@/components/admin/HeroManager";

export default async function HeroManagementPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/giris?error=admin_required");
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hero Slider Yönetimi</h1>
        <p className="text-gray-600 mt-1">
          Ana sayfa hero slider içeriklerini yönetin
        </p>
      </div>

      <HeroManager />
    </div>
  );
}


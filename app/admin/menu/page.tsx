import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import MenuManager from "@/components/admin/MenuManager";
import ContactInfoManager from "@/components/admin/ContactInfoManager";
import SeedButton from "@/components/admin/SeedButton";

export default async function MenuManagementPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/giris?error=admin_required");
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Menü Yönetimi</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Header ve Footer menülerini, bölüm başlıklarını yönetin
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <SeedButton />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <MenuManager />
        <ContactInfoManager />
      </div>
    </div>
  );
}


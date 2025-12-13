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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menü Yönetimi</h1>
          <p className="text-gray-600 mt-1">
            Header ve Footer menülerini, bölüm başlıklarını yönetin
          </p>
        </div>
        <SeedButton />
      </div>

      <div className="space-y-6">
        <MenuManager />
        <ContactInfoManager />
      </div>
    </div>
  );
}


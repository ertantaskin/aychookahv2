import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LogoManager from "@/components/admin/LogoManager";

export default async function LogoSettingsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/giris?error=admin_required");
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-bold text-gray-900">Logo Ayarları</h1>
        <p className="text-sm text-gray-500 mt-1">Header ve Footer logolarını yönetin</p>
      </div>
      <LogoManager />
    </div>
  );
}


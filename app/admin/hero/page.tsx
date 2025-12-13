import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import HeroManager from "@/components/admin/HeroManager";

export default async function HeroManagementPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/giris?error=admin_required");
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <HeroManager />
    </div>
  );
}


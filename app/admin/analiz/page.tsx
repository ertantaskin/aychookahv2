import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AnalyticsClient from "@/components/admin/AnalyticsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/giris?error=admin_required");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-sans font-semibold text-gray-800">Analiz ve Raporlar</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <AnalyticsClient />
      </div>
    </div>
  );
}


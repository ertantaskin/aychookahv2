import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/giris?error=admin_required");
  }

  return (
    <div className="min-h-screen bg-gray-50 admin-content">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 transition-all duration-150 ease-out" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}


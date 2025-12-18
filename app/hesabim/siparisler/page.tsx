import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getOrdersPaginated } from "@/lib/actions/orders";
import Link from "next/link";
import OrdersClient from "@/components/account/OrdersClient";

export default async function OrdersPage() {
  const session = await getSession();

  if (!session || session.user.role !== "user") {
    redirect("/giris?error=login_required");
  }

  // İlk sayfa için siparişleri getir
  const result = await getOrdersPaginated(session.user.id, 1, 15);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/hesabim"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-sans font-semibold text-gray-900">Siparişlerim</h1>
          </div>
        </div>

        <OrdersClient
          initialOrders={result.orders}
          initialTotal={result.total}
          userId={session.user.id}
        />
      </div>
    </div>
  );
}


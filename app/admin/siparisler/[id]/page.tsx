import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrder } from "@/lib/actions/admin/orders";
import { updateOrderStatus } from "@/lib/actions/admin/orders";
import OrderDetailClient from "@/components/admin/OrderDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/giris?error=admin_required");
  }

  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    redirect("/admin/siparisler");
  }

  return <OrderDetailClient order={order} />;
}


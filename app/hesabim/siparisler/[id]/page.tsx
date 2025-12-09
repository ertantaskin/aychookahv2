import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getOrder } from "@/lib/actions/orders";
import Link from "next/link";
import OrderDetailClient from "@/components/account/OrderDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await getSession();

  if (!session || session.user.role !== "user") {
    redirect("/giris?error=login_required");
  }

  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    redirect("/hesabim/siparisler");
  }

  return <OrderDetailClient order={order} />;
}


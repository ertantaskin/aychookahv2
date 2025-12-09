import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPaymentGateways } from "@/lib/actions/admin/payment-gateways";
import PaymentGatewaysClient from "@/components/admin/payment-gateways/PaymentGatewaysClient";

export const metadata: Metadata = {
  title: "Ödeme Sistemleri | Admin Panel",
  description: "Ödeme sistemlerini yönetin",
};

export default async function PaymentGatewaysPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/giris");
  }

  const gateways = await getPaymentGateways();

  // Type assertion - Prisma'dan gelen config'i dönüştür
  const typedGateways = gateways.map((gateway) => ({
    ...gateway,
    config: (gateway.config as any) || {},
  }));

  return <PaymentGatewaysClient initialGateways={typedGateways} />;
}


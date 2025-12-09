import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCart } from "@/lib/actions/cart";
import { getOrder } from "@/lib/actions/orders";
import { getAddresses } from "@/lib/actions/addresses";
import { prisma } from "@/lib/prisma";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Ödeme",
  description: "Siparişinizi tamamlayın",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CheckoutPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/giris?error=login_required");
  }

  const params = await searchParams;
  const retryOrderId = params.retry as string | undefined;

  // Eğer retry parametresi varsa, mevcut PENDING siparişi getir
  let retryOrder = null;
  if (retryOrderId) {
    try {
      retryOrder = await prisma.order.findUnique({
        where: { id: retryOrderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      // Sipariş kontrolü
      if (!retryOrder || retryOrder.userId !== session.user.id) {
        redirect("/sepet?error=order_not_found");
      }

      if (retryOrder.paymentStatus !== "PENDING" && retryOrder.paymentStatus !== "FAILED") {
        redirect("/sepet?error=order_not_retryable");
      }
    } catch (error) {
      console.error("Error fetching retry order:", error);
      redirect("/sepet?error=order_not_found");
    }
  }

  // Kullanıcının kayıtlı adreslerini getir
  const addresses = await getAddresses();

  // Retry durumunda sepet kontrolü yapmıyoruz, mevcut siparişi kullanıyoruz
  // Normal durumda sepet kontrolü yapıyoruz
  if (!retryOrderId) {
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    redirect("/sepet");
  }

    return <CheckoutClient cart={cart} retryOrder={null} addresses={addresses} userEmail={session.user.email || ""} />;
  }

  // Retry durumunda - mevcut siparişi kullan
  return <CheckoutClient cart={null} retryOrder={retryOrder} addresses={addresses} userEmail={session.user.email || ""} />;
}


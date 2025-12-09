import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    orderId?: string;
    orderNumber?: string;
  }>;
}

// Eski EFT/Havale sayfası - artık ortak başarı sayfasına yönlendiriyoruz
export default async function EftHavalePage(props: PageProps) {
  const searchParams = await props.searchParams;
  const orderId = searchParams.orderId;
  const orderNumber = searchParams.orderNumber;

  // Ortak başarı sayfasına yönlendir
  if (orderId) {
    const params = new URLSearchParams({
      orderId: orderId,
      paymentMethod: "eft-havale",
    });
    if (orderNumber) {
      params.append("orderNumber", orderNumber);
    }
    redirect(`/odeme/basarili?${params.toString()}`);
  } else {
    redirect("/sepet");
  }
}


import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import PaymentIframeClient from "@/components/checkout/PaymentIframeClient";

export const metadata: Metadata = {
  title: "Ödeme",
  description: "Ödeme işleminizi tamamlayın",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PaymentIframePage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/giris?error=login_required");
  }

  const params = await searchParams;
  const token = params.token as string;

  // Token kontrolü - token yoksa ödeme sayfasına yönlendir
  if (!token || token.trim() === "") {
    redirect("/odeme?error=missing_token");
  }

  // Token varsa, iframe'i göster
  // checkoutFormContent client-side'da sessionStorage'dan alınacak
  // Not: Cart kontrolü yapmıyoruz çünkü ödeme başlatıldığında sepet zaten temizleniyor
    return <PaymentIframeClient token={token} />;
}


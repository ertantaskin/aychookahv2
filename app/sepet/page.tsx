import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getCart } from "@/lib/actions/cart";
import CartClient from "@/components/cart/CartClient";

export const metadata: Metadata = {
  title: "Sepetim",
  description: "Sepetinizdeki ürünleri görüntüleyin ve düzenleyin",
};

export default async function CartPage() {
  const session = await auth();
  const cart = session?.user ? await getCart() : null;

  return <CartClient cart={cart} />;
}


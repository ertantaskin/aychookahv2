import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    // User tablosunda kullanıcı var mı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: true,
      },
    });

    const count = cart
      ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
      : 0;

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}


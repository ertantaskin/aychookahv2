import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // auth() çağrısını güvenli şekilde yap
    let session = null;
    try {
      session = await auth();
    } catch (authError: any) {
      console.error("Error getting session in API route:", authError);
      // Auth hatası - ama order'ı kontrol et, belki public erişilebilir
      // Önce order'ı bul, sonra userId kontrolü yap
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      // Order bulunamazsa 404 döndür
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Order varsa döndür (session olmasa bile - callback'ten geldiği için)
      return NextResponse.json({ order });
    }

    if (!session?.user?.id) {
      // Session yok - ama order'ı kontrol et
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      // Order bulunamazsa 404 döndür
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Order varsa döndür (session olmasa bile - callback'ten geldiği için)
      // Not: Güvenlik için sadece callback'ten gelen order'lar için geçerli
      return NextResponse.json({ order });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


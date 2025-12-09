import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Medya listesi
export async function GET(request: NextRequest) {
  try {
    // Admin kontrolü
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { alt: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type) {
      where.type = type;
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Media list error:", error);
    return NextResponse.json(
      { error: "Medya listesi yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Medya kaydı oluştur (upload tamamlandıktan sonra)
export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, type, size, mimeType, alt, description, fileName } = body;

    if (!name || !url || !type || !mimeType) {
      return NextResponse.json(
        { error: "Gerekli alanlar eksik" },
        { status: 400 }
      );
    }

    // Validate image types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: "Sadece görsel dosyaları yüklenebilir" },
        { status: 400 }
      );
    }

    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (size > maxSize) {
      return NextResponse.json(
        { error: "Dosya boyutu 10MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    // Check if user exists in User table (admin users might be in Admin table)
    // For now, set uploadedBy to null if user doesn't exist in User table
    let uploadedByUserId: string | null = null;
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (user) {
        uploadedByUserId = session.user.id;
      }
    } catch (userCheckError) {
      // User not found in User table, might be admin - set to null
      console.log("User not found in User table, setting uploadedBy to null");
    }

    const media = await prisma.media.create({
      data: {
        name,
        url,
        type: "image", // Always image for now
        size,
        mimeType,
        alt: alt || null,
        description: description || null,
        uploadedBy: uploadedByUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error: any) {
    console.error("Media creation error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: error.message || "Medya oluşturulurken bir hata oluştu",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


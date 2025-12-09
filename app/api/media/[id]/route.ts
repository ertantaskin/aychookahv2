import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile, extractFileNameFromUrl, moveFile, getPublicUrl } from "@/lib/utils/r2";

// GET - Tek medya detayı
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin kontrolü
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;

    const media = await prisma.media.findUnique({
      where: { id },
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

    if (!media) {
      return NextResponse.json({ error: "Medya bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ media });
  } catch (error: any) {
    console.error("Media fetch error:", error);
    return NextResponse.json(
      { error: "Medya yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Medya güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin kontrolü
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, url, alt, description } = body;

    // Validate required fields
    if (!name || !url) {
      return NextResponse.json(
        { error: "Görsel adı ve URL gerekli" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Geçersiz URL formatı" },
        { status: 400 }
      );
    }

    // Get current media to compare URLs
    const currentMedia = await prisma.media.findUnique({
      where: { id },
    });

    if (!currentMedia) {
      return NextResponse.json(
        { error: "Medya bulunamadı" },
        { status: 404 }
      );
    }

    // Check if URL has changed - handle null/undefined values
    const oldUrl = currentMedia.url ? currentMedia.url.trim() : "";
    const newUrl = url ? url.trim() : "";
    let finalUrl = newUrl || "";

    // If URL changed and it's an R2 URL, move the file
    if (oldUrl !== newUrl) {
      try {
        // Extract file names from URLs
        const oldFileName = extractFileNameFromUrl(oldUrl);
        const newFileName = extractFileNameFromUrl(newUrl);

        // Check if both are valid R2 file paths
        if (oldFileName && newFileName && oldFileName !== newFileName) {
          // Check if old file name is a valid R2 path (not just the URL)
          if (oldFileName !== oldUrl && newFileName !== newUrl) {
            console.log(`Moving file from ${oldFileName} to ${newFileName}`);
            await moveFile(oldFileName, newFileName);
            // Update URL to match the new file location
            finalUrl = getPublicUrl(newFileName);
            console.log(`File moved successfully. New URL: ${finalUrl}`);
          } else {
            console.log("URL changed but file paths are not valid R2 paths, skipping file move");
          }
        }
      } catch (error: any) {
        console.error("Error moving file in R2:", error);
        // Continue with URL update even if file move fails
        // User can manually fix the file location if needed
      }
    }

    // Update media - handle null/undefined values safely
    const media = await prisma.media.update({
      where: { id },
      data: {
        name: name ? name.trim() : "",
        url: finalUrl || "",
        alt: alt !== undefined && alt !== null ? (alt.trim() || null) : undefined,
        description:
          description !== undefined && description !== null
            ? (description.trim() || null)
            : undefined,
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

    return NextResponse.json({ media });
  } catch (error: any) {
    console.error("Media update error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Medya bulunamadı" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Medya güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE - Medya sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin kontrolü
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;

    // Get media record
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Medya bulunamadı" }, { status: 404 });
    }

    // Check if media is being used
    if (media.usageCount > 0) {
      return NextResponse.json(
        { error: "Bu medya kullanımda olduğu için silinemez" },
        { status: 400 }
      );
    }

    // Extract file name from URL and delete from R2
    let r2DeleteError: Error | null = null;
    try {
      const fileName = extractFileNameFromUrl(media.url);
      console.log("Attempting to delete file from R2:", fileName);
      console.log("Original URL:", media.url);
      
      if (!fileName || fileName === media.url) {
        throw new Error("Dosya adı URL'den çıkarılamadı");
      }
      
      await deleteFile(fileName);
      console.log("File successfully deleted from R2:", fileName);
    } catch (error: any) {
      r2DeleteError = error;
      console.error("R2 delete error:", error);
      console.error("Media URL:", media.url);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
      // Continue with database deletion even if R2 delete fails
      // but log the error for debugging
    }

    // Delete from database
    await prisma.media.delete({
      where: { id },
    });

    // Return success, but include warning if R2 delete failed
    if (r2DeleteError) {
      return NextResponse.json(
        {
          success: true,
          warning: "Medya veritabanından silindi ancak R2'den silinirken bir hata oluştu. Lütfen manuel olarak kontrol edin.",
          error: r2DeleteError.message,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Media deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Medya silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl, generateFileName, getPublicUrl } from "@/lib/utils/r2";

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, contentType, originalName } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName ve contentType gerekli" },
        { status: 400 }
      );
    }

    // Generate unique file name if originalName is provided
    const finalFileName = originalName
      ? generateFileName(originalName, session.user.id)
      : fileName;

    // Get presigned URL for upload
    const uploadUrl = await getPresignedUploadUrl(finalFileName, contentType);
    const publicUrl = getPublicUrl(finalFileName);

    return NextResponse.json({
      uploadUrl,
      fileName: finalFileName,
      publicUrl,
    });
  } catch (error: any) {
    console.error("Upload URL generation error:", error);
    return NextResponse.json(
      { error: error.message || "Upload URL oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}


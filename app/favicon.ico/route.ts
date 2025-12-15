import { NextRequest, NextResponse } from "next/server";
import { getSiteSEO } from "@/lib/actions/seo";

/**
 * Favicon route handler
 * Veritabanından favicon URL'ini alır ve redirect yapar
 * Eğer favicon yoksa 204 No Content döner
 */
export async function GET(request: NextRequest) {
  try {
    const siteSEO = await getSiteSEO();
    
    if (siteSEO?.favicon) {
      // Favicon URL'i varsa redirect yap
      return NextResponse.redirect(siteSEO.favicon, 302);
    }
    
    // Favicon yoksa 404 döner (tarayıcı varsayılan favicon kullanır)
    return new NextResponse(null, { status: 404 });
  } catch (error) {
    console.error("Error fetching favicon:", error);
    // Hata durumunda 404 döner
    return new NextResponse(null, { status: 404 });
  }
}


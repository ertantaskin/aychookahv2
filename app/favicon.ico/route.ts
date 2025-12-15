import { NextRequest, NextResponse } from "next/server";
import { getSiteSEO } from "@/lib/actions/seo";

/**
 * Favicon route handler
 * Veritabanından favicon URL'ini alır ve favicon'u serve eder
 * Eğer favicon yoksa 404 döner
 */
export async function GET(request: NextRequest) {
  try {
    const siteSEO = await getSiteSEO();
    
    if (siteSEO?.favicon && siteSEO.favicon.trim() !== "") {
      // Favicon URL'i varsa, görseli fetch et ve serve et
      try {
        const faviconResponse = await fetch(siteSEO.favicon, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FaviconBot/1.0)',
          },
        });

        if (faviconResponse.ok) {
          const imageBuffer = await faviconResponse.arrayBuffer();
          const contentType = faviconResponse.headers.get('content-type') || 'image/x-icon';
          
          // Cache headers ekle (1 yıl)
          const headers = new Headers();
          headers.set('Content-Type', contentType);
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          headers.set('Access-Control-Allow-Origin', '*');
          
          return new NextResponse(imageBuffer, {
            status: 200,
            headers,
          });
        } else {
          // Fetch başarısız oldu, redirect yap
          return NextResponse.redirect(siteSEO.favicon, 302);
        }
      } catch (fetchError) {
        // Fetch hatası, redirect yap
        console.error("Error fetching favicon image:", fetchError);
        return NextResponse.redirect(siteSEO.favicon, 302);
      }
    }
    
    // Favicon yoksa 404 döner (tarayıcı varsayılan favicon kullanır)
    return new NextResponse(null, { status: 404 });
  } catch (error) {
    console.error("Error in favicon route:", error);
    // Hata durumunda 404 döner
    return new NextResponse(null, { status: 404 });
  }
}


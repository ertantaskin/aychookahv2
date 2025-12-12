import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  
  // Production'da çalış (localhost ve development'ta çalışma)
  const isProduction = process.env.NODE_ENV === "production" && 
                       hostname !== "localhost" && 
                       !hostname.includes("localhost:") &&
                       !hostname.includes("127.0.0.1");
  
  if (isProduction) {
    // Hostname'den port'u temizle (varsa)
    const cleanHostname = hostname.split(":")[0];
    
    // 1. HTTP'den HTTPS'e zorunlu yönlendirme
    if (url.protocol === "http:") {
      // Port olmadan yeni URL oluştur
      const httpsUrl = new URL(url.pathname + url.search, `https://${cleanHostname}`);
      return NextResponse.redirect(httpsUrl, 301); // 301 Permanent Redirect
    }
    
    // 2. www'den non-www'ye yönlendirme (dinamik domain)
    if (cleanHostname.startsWith("www.")) {
      const nonWwwHostname = cleanHostname.replace(/^www\./, "");
      // Port olmadan yeni URL oluştur
      const nonWwwUrl = new URL(url.pathname + url.search, `https://${nonWwwHostname}`);
      return NextResponse.redirect(nonWwwUrl, 301); // 301 Permanent Redirect
    }
  }
  
  const path = url.pathname;
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Admin giriş sayfasına erişim serbest
  if (path === "/admin/giris") {
    return NextResponse.next();
  }

  // Admin route'ları için admin kontrolü
  if (path.startsWith("/admin")) {
    if (!token || token.role !== "admin") {
      const url = new URL("/admin/giris", request.url);
      url.searchParams.set("error", "admin_required");
      return NextResponse.redirect(url);
    }
  }

  // Kullanıcı route'ları için user kontrolü (sadece hesabım sayfası)
  if (path.startsWith("/hesabim")) {
    if (!token || token.role !== "user") {
      const url = new URL("/giris", request.url);
      url.searchParams.set("error", "login_required");
      return NextResponse.redirect(url);
    }
  }

  // Pathname'i header'a ekle (admin sayfaları için padding kontrolü için)
  const response = NextResponse.next();
  response.headers.set("x-pathname", path);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin/giris (admin login page - should be accessible)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|admin/giris).*)",
  ],
};

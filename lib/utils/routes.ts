import { prisma } from "@/lib/prisma";

// Next.js app directory'deki mevcut route'ları döndürür
export function getAvailableRoutes(): string[] {
  // Statik route'lar - app klasöründen tespit edilen sayfalar
  const staticRoutes = [
    "/",
    "/urunler",
    "/hakkimizda",
    "/iletisim",
    "/sepet",
    "/hesabim",
    "/giris",
    "/kayit",
    "/odeme",
  ];

  return staticRoutes;
}

// Veritabanındaki PageSEO kayıtlarından sayfa listesi çıkarır
export async function getPageRoutesFromDB(): Promise<string[]> {
  try {
    const pageSEOList = await prisma.pageSEO.findMany({
      select: {
        pagePath: true,
      },
      distinct: ["pagePath"],
    });

    return pageSEOList.map((page) => page.pagePath);
  } catch (error) {
    console.error("Error fetching page routes from DB:", error);
    return [];
  }
}

// Tüm mevcut sayfaları birleştirir
export async function getAllAvailablePages(): Promise<Array<{ path: string; label: string }>> {
  const staticRoutes = getAvailableRoutes();
  const dbRoutes = await getPageRoutesFromDB();

  // Tüm route'ları birleştir ve unique yap
  const allRoutes = Array.from(new Set([...staticRoutes, ...dbRoutes]));

  // Route'ları label'larla eşleştir
  const routeLabels: Record<string, string> = {
    "/": "Ana Sayfa",
    "/urunler": "Ürünler",
    "/hakkimizda": "Hakkımızda",
    "/iletisim": "İletişim",
    "/sepet": "Sepet",
    "/hesabim": "Hesabım",
    "/giris": "Giriş",
    "/kayit": "Kayıt",
    "/odeme": "Ödeme",
  };

  // Sıralama: Önce bilinen sayfalar, sonra diğerleri
  const knownPages = allRoutes.filter(r => routeLabels[r]);
  const unknownPages = allRoutes.filter(r => !routeLabels[r]);

  return [
    ...knownPages.map((path) => ({
      path,
      label: routeLabels[path],
    })),
    ...unknownPages.map((path) => ({
      path,
      label: path,
    })),
  ];
}


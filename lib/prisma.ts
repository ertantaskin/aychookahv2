import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Connection pool ayarları ve error handling ile Prisma client oluştur
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Connection pool ayarları
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Error handling için
    errorFormat: "pretty",
  });

// Production'da da singleton pattern kullan (Next.js serverless functions için önemli)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // Production'da da global'e kaydet
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown için disconnect handler
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

// Connection error handling wrapper
export async function withPrisma<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    // Bağlantı kapalıysa yeniden bağlan
    try {
      await prisma.$connect();
    } catch (connectError) {
      console.error("Prisma connection error:", connectError);
      // Bağlantı hatası durumunda yeniden dene
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await prisma.$connect();
    }
    
    return await operation(prisma);
  } catch (error: any) {
    // Connection closed hatası durumunda yeniden dene
    if (error?.message?.includes("Closed") || error?.kind === "Closed") {
      console.warn("Prisma connection closed, retrying...");
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        return await operation(prisma);
      } catch (retryError) {
        console.error("Prisma retry failed:", retryError);
        throw retryError;
      }
    }
    throw error;
  }
}


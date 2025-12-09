import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@aychookah.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin";

  // Şifreyi hashle
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Mevcut admin var mı kontrol et
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("❌ Bu email ile zaten bir admin kullanıcısı var!");
      console.log(`Email: ${email}`);
      return;
    }

    // Admin oluştur
    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("✅ Admin kullanıcısı başarıyla oluşturuldu!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", email);
    console.log("🔑 Şifre:", password);
    console.log("👤 İsim:", name);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  Bu bilgileri güvenli bir yerde saklayın!");
    console.log("💡 Giriş yapmak için: /giris sayfasına gidin ve 'Admin' seçeneğini seçin.");
  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();


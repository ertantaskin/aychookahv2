import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Kategoriler oluştur
  const categories = [
    { name: "Nargile Takımları", slug: "nargile-takimlari" },
    { name: "Nargile Lüleri", slug: "nargile-luleri" },
    { name: "Nargile Camları", slug: "nargile-camlari" },
    { name: "Aksesuarlar", slug: "aksesuarlar" },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
  }

  console.log("✅ Categories created");

  // Örnek ürünler oluştur
  const products = [
    {
      name: "X Hoob Go Pro Gold",
      slug: "x-hoob-go-pro-gold",
      description: "Premium kalite, altın kaplama detaylar, profesyonel performans",
      price: 7999,
      stock: 10,
      categoryId: createdCategories[0].id,
      material: "Paslanmaz Çelik",
      height: "75cm",
      equipmentType: "Komple Set",
      isNew: true,
      isBestseller: true,
      features: ["Altın Kaplama", "Premium Kalite", "Profesyonel"],
      images: [
        { url: "/images/products/product-1.jpg", alt: "X Hoob Go Pro Gold", isPrimary: true },
      ],
    },
    {
      name: "Go Pro Mini",
      slug: "go-pro-mini",
      description: "Kompakt tasarım, yüksek kalite, taşınabilir",
      price: 4999,
      stock: 15,
      categoryId: createdCategories[0].id,
      material: "Paslanmaz Çelik",
      height: "45cm",
      equipmentType: "Komple Set",
      isBestseller: true,
      features: ["Kompakt", "Taşınabilir", "Yüksek Kalite"],
      images: [
        { url: "/images/products/product-2.jpg", alt: "Go Pro Mini", isPrimary: true },
      ],
    },
  ];

  for (const product of products) {
    const { features, images, ...productData } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...productData,
        features: {
          create: features.map((name) => ({ name })),
        },
        images: {
          create: images,
        },
      },
    });
  }

  console.log("✅ Products created");

  // Admin kullanıcısı oluştur (eğer yoksa)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@aychookah.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("✅ Admin user created");
  console.log("📧 Email:", adminEmail);
  console.log("🔑 Password:", adminPassword);

  // Varsayılan mağaza ayarlarını oluştur
  await prisma.storeSettings.upsert({
    where: { key: "tax" },
    update: {},
    create: {
      key: "tax",
      config: {
        defaultTaxRate: 0.20, // %20 KDV
        taxIncluded: true, // Fiyatlar KDV dahil
        rules: [],
      },
    },
  });

  await prisma.storeSettings.upsert({
    where: { key: "shipping" },
    update: {},
    create: {
      key: "shipping",
      config: {
        defaultShippingCost: 0, // Varsayılan kargo ücretsiz
        freeShippingThreshold: null, // Ücretsiz kargo eşiği yok
        estimatedDeliveryDays: 3, // Tahmini teslimat 3 gün
        rules: [],
      },
    },
  });

  console.log("✅ Store settings created");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


// Test script for new database connection
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://aychookahusr:imM4dE4svB1meGbVsNzrYy9eGy0lkduS7xZI63nB9B8H0k1V18RtIvVlh1JE52UF@188.245.125.21:5434/aychookahdbs"
    }
  }
});

async function testDatabase() {
  try {
    console.log('🔌 Veritabanına bağlanılıyor...');
    
    // Bağlantı testi
    await prisma.$connect();
    console.log('✅ Bağlantı başarılı!');
    
    // Veri sayılarını kontrol et
    console.log('\n📊 Veri İstatistikleri:');
    
    const users = await prisma.user.count();
    console.log(`   👥 Kullanıcılar: ${users}`);
    
    const products = await prisma.product.count();
    console.log(`   📦 Ürünler: ${products}`);
    
    const categories = await prisma.category.count();
    console.log(`   📁 Kategoriler: ${categories}`);
    
    const orders = await prisma.order.count();
    console.log(`   🛒 Siparişler: ${orders}`);
    
    const reviews = await prisma.review.count();
    console.log(`   ⭐ Yorumlar: ${reviews}`);
    
    // Örnek veri okuma
    console.log('\n📋 Örnek Veriler:');
    
    const firstProduct = await prisma.product.findFirst({
      include: {
        category: true,
        images: true,
      }
    });
    
    if (firstProduct) {
      console.log(`   Ürün: ${firstProduct.name}`);
      console.log(`   Kategori: ${firstProduct.category?.name || 'N/A'}`);
      console.log(`   Fiyat: ${firstProduct.price} ₺`);
      console.log(`   Stok: ${firstProduct.stock}`);
    }
    
    const firstOrder = await prisma.order.findFirst({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (firstOrder) {
      console.log(`\n   Son Sipariş: #${firstOrder.orderNumber}`);
      console.log(`   Toplam: ${firstOrder.total} ₺`);
      console.log(`   Durum: ${firstOrder.status}`);
      console.log(`   Kalem Sayısı: ${firstOrder.items.length}`);
    }
    
    console.log('\n✅ Tüm testler başarılı!');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Bağlantı kapatıldı.');
  }
}

testDatabase();


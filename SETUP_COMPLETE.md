# ✅ Sistem Kurulumu Tamamlandı

## 🎉 Yapılan İşlemler

1. ✅ Prisma Client generate edildi
2. ✅ Environment variables ayarlandı (`.env.local`)
3. ✅ Development server başlatıldı

## ⚠️ Önemli Notlar

### Veritabanı Kurulumu Gerekli

PostgreSQL veritabanınızı kurmanız ve migration'ları çalıştırmanız gerekiyor:

```bash
# 1. PostgreSQL'in çalıştığından emin olun
# macOS için:
brew services start postgresql

# 2. Veritabanını oluşturun
createdb mydb

# 3. Migration'ları çalıştırın
npm run db:migrate

# 4. Seed verilerini yükleyin (opsiyonel)
npm run db:seed
```

### Environment Variables

`.env.local` dosyası oluşturuldu. Lütfen aşağıdaki değerleri güncelleyin:

- **DATABASE_URL**: PostgreSQL bağlantı string'inizi güncelleyin
- **IYZICO_API_KEY**: Gerçek iyzico API key'inizi ekleyin
- **IYZICO_SECRET_KEY**: Gerçek iyzico secret key'inizi ekleyin

### Development Server

Server `http://localhost:3000` adresinde çalışıyor.

## 🚀 Hızlı Başlangıç

1. **Veritabanını hazırlayın:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

2. **Admin kullanıcısı oluşturun (eğer seed çalıştırmadıysanız):**
   ```bash
   npm run create-admin
   ```

3. **Tarayıcıda açın:**
   - Ana sayfa: http://localhost:3000
   - Admin paneli: http://localhost:3000/admin
   - Giriş: http://localhost:3000/giris

## 📝 Varsayılan Admin Bilgileri

- **Email:** admin@aychookah.com
- **Password:** admin123

## 🔧 Sorun Giderme

### Veritabanı Bağlantı Hatası

Eğer "Can't reach database server" hatası alırsanız:

1. PostgreSQL'in çalıştığından emin olun
2. `.env.local` dosyasındaki `DATABASE_URL` değerini kontrol edin
3. Veritabanının oluşturulduğundan emin olun

### Port Zaten Kullanılıyor

Eğer port 3000 kullanılıyorsa:

```bash
# Farklı bir port kullanın
PORT=3001 npm run dev
```

## 📚 Sonraki Adımlar

1. Veritabanını kurun ve migration'ları çalıştırın
2. Seed verilerini yükleyin
3. Admin paneline giriş yapın
4. İlk ürünlerinizi ekleyin
5. iyzico API key'lerinizi güncelleyin

Sistem hazır! 🎊


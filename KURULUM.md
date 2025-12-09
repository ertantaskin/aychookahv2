# Aychookah E-Ticaret Kurulum Rehberi

## Gereksinimler

- Node.js 18+ 
- PostgreSQL veritabanı
- npm veya yarn

## Kurulum Adımları

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Environment Variables Ayarlayın

`.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aychookah"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# iyzico Payment Gateway
IYZICO_API_KEY="your-iyzico-api-key"
IYZICO_SECRET_KEY="your-iyzico-secret-key"
IYZICO_URI="https://sandbox-api.iyzipay.com"
# Production için: IYZICO_URI="https://api.iyzipay.com"

# Admin User (for create-admin script)
ADMIN_EMAIL="admin@aychookah.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="Admin"
```

**NEXTAUTH_SECRET oluşturma:**
```bash
openssl rand -base64 32
```

### 3. Veritabanı Migration'larını Çalıştırın

```bash
# Prisma client'ı generate edin
npx prisma generate

# Migration oluşturun ve uygulayın
npx prisma migrate dev --name init

# Veya mevcut migration'ları uygulayın
npx prisma migrate deploy
```

### 4. Admin Kullanıcısı Oluşturun

```bash
npm run create-admin
```

Bu komut `.env.local` dosyasındaki `ADMIN_EMAIL`, `ADMIN_PASSWORD` ve `ADMIN_NAME` değerlerini kullanarak admin kullanıcısı oluşturur.

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## İlk Kullanım

### Admin Paneline Giriş

1. `/giris` sayfasına gidin
2. "Admin" seçeneğini seçin
3. `.env.local` dosyasındaki admin bilgileriyle giriş yapın
4. `/admin` sayfasına yönlendirileceksiniz

### İlk Ürün Ekleme

1. Admin paneline giriş yapın
2. `/admin/urunler` sayfasına gidin
3. "Yeni Ürün" butonuna tıklayın
4. Ürün bilgilerini doldurun ve kaydedin

### İlk Kategori Ekleme

Kategorileri veritabanına manuel olarak eklemeniz gerekiyor. Örnek:

```sql
INSERT INTO categories (id, name, slug, "createdAt", "updatedAt") 
VALUES ('cuid-here', 'Nargile Takımları', 'nargile-takimlari', NOW(), NOW());
```

Veya Prisma Studio kullanarak:

```bash
npx prisma studio
```

## Önemli Notlar

### iyzico Test Ortamı

Test için iyzico sandbox kullanın:
- API Key ve Secret Key'i iyzico test hesabınızdan alın
- `IYZICO_URI="https://sandbox-api.iyzipay.com"` olarak ayarlayın

### Production Deployment

1. Environment variables'ı production ortamında ayarlayın
2. `IYZICO_URI="https://api.iyzipay.com"` olarak güncelleyin
3. `NEXT_PUBLIC_APP_URL` değerini production URL'inizle değiştirin
4. Veritabanı migration'larını çalıştırın:
   ```bash
   npx prisma migrate deploy
   ```

## Sorun Giderme

### Prisma Client Hatası

Eğer "Module not found: Can't resolve '@/app/generated/prisma'" hatası alırsanız:

```bash
npx prisma generate
```

### Veritabanı Bağlantı Hatası

- PostgreSQL'in çalıştığından emin olun
- `DATABASE_URL` değerinin doğru olduğunu kontrol edin
- Veritabanının oluşturulduğundan emin olun

### NextAuth Hatası

- `NEXTAUTH_SECRET` değerinin ayarlandığından emin olun
- `NEXTAUTH_URL` değerinin doğru olduğunu kontrol edin

## Proje Yapısı

```
app/
├── admin/              # Admin paneli
├── urunler/            # Ürün listesi ve detay
├── sepet/              # Sepet sayfası
├── odeme/              # Checkout ve ödeme
└── api/auth/           # NextAuth API

lib/
├── actions/            # Server actions
│   ├── products.ts
│   ├── cart.ts
│   ├── orders.ts
│   ├── payment.ts
│   └── admin/
├── prisma.ts           # Prisma client
└── auth.ts             # NextAuth config

components/
├── products/           # Ürün componentleri
├── cart/               # Sepet componentleri
├── checkout/           # Checkout componentleri
└── admin/             # Admin componentleri
```

## Destek

Sorun yaşarsanız:
1. Console log'larını kontrol edin
2. Prisma Studio ile veritabanını kontrol edin: `npx prisma studio`
3. Next.js build log'larını inceleyin: `npm run build`


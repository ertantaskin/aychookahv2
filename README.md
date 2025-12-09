# Aychookah E-Ticaret Platformu

Modern, güvenli ve ölçeklenebilir e-ticaret platformu. Next.js 15, Prisma, PostgreSQL ve iyzico ödeme entegrasyonu ile geliştirilmiştir.

## 🚀 Özellikler

### Müşteri Tarafı
- ✅ Ürün listeleme ve filtreleme
- ✅ Ürün detay sayfaları
- ✅ Sepet yönetimi
- ✅ Kullanıcı girişi/kayıt
- ✅ Checkout süreci
- ✅ iyzico ödeme entegrasyonu
- ✅ Sipariş takibi
- ✅ Responsive tasarım

### Admin Paneli
- ✅ Dashboard ve istatistikler
- ✅ Ürün yönetimi (CRUD)
- ✅ Sipariş yönetimi
- ✅ Kullanıcı yönetimi
- ✅ Stok takibi

## 📋 Gereksinimler

- Node.js 18+
- PostgreSQL 12+
- npm veya yarn

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Environment Variables

`.env.local` dosyası oluşturun:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aychookah"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# iyzico (Test için sandbox kullanın)
IYZICO_API_KEY="your-api-key"
IYZICO_SECRET_KEY="your-secret-key"
IYZICO_URI="https://sandbox-api.iyzipay.com"

# Admin (opsiyonel)
ADMIN_EMAIL="admin@aychookah.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="Admin"
```

**NEXTAUTH_SECRET oluşturma:**
```bash
openssl rand -base64 32
```

### 3. Veritabanı Kurulumu

```bash
# Migration oluştur ve uygula
npm run db:migrate

# Prisma client generate et
npm run db:generate

# Veritabanını seed et (örnek veriler)
npm run db:seed
```

### 4. Geliştirme Sunucusu

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📝 Kullanılabilir Komutlar

```bash
# Geliştirme
npm run dev              # Geliştirme sunucusu
npm run build            # Production build
npm run start            # Production sunucu

# Veritabanı
npm run db:migrate       # Migration oluştur/uygula
npm run db:generate      # Prisma client generate
npm run db:seed          # Veritabanını seed et
npm run db:studio        # Prisma Studio aç

# Admin
npm run create-admin     # Admin kullanıcısı oluştur
```

## 🔐 İlk Kullanım

### Admin Paneline Giriş

1. `/giris` sayfasına gidin
2. "Admin" seçeneğini seçin
3. Seed script'teki veya `.env.local`'deki admin bilgileriyle giriş yapın
4. `/admin` sayfasına yönlendirileceksiniz

**Varsayılan Admin:**
- Email: `admin@aychookah.com`
- Password: `admin123`

### İlk Ürün Ekleme

1. Admin paneline giriş yapın
2. `/admin/urunler` sayfasına gidin
3. "Yeni Ürün" butonuna tıklayın
4. Ürün bilgilerini doldurun ve kaydedin

## 📁 Proje Yapısı

```
app/
├── admin/              # Admin paneli
│   ├── urunler/        # Ürün yönetimi
│   ├── siparisler/     # Sipariş yönetimi
│   └── kullanicilar/   # Kullanıcı yönetimi
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
└── admin/              # Admin componentleri
```

## 🔒 Güvenlik

- ✅ NextAuth.js ile güvenli kimlik doğrulama
- ✅ Server-side validation
- ✅ SQL injection koruması (Prisma)
- ✅ XSS koruması
- ✅ CSRF koruması (Next.js built-in)
- ✅ Environment variables ile hassas bilgi yönetimi

## 💳 Ödeme Entegrasyonu

### iyzico Test Ortamı

Test için iyzico sandbox kullanın:
- API Key ve Secret Key'i iyzico test hesabınızdan alın
- `IYZICO_URI="https://sandbox-api.iyzipay.com"` olarak ayarlayın

### Production

Production'da:
- Gerçek API key'leri kullanın
- `IYZICO_URI="https://api.iyzipay.com"` olarak güncelleyin

## 🚢 Deployment

### Vercel

1. GitHub'a push edin
2. Vercel'e import edin
3. Environment variables'ı ekleyin
4. Deploy edin

### Diğer Platformlar

- Environment variables'ı ayarlayın
- `npm run build` ile build alın
- `npm run start` ile başlatın
- Migration'ları çalıştırın: `npm run db:migrate`

## 🐛 Sorun Giderme

### Veritabanı Bağlantı Hatası

- PostgreSQL'in çalıştığından emin olun
- `DATABASE_URL` değerini kontrol edin
- Migration'ları çalıştırdığınızdan emin olun

### Prisma Client Hatası

```bash
npx prisma generate
```

### NextAuth Hatası

- `NEXTAUTH_SECRET` değerini kontrol edin
- `NEXTAUTH_URL` değerini kontrol edin

### iyzico Hatası

- API key'lerin doğru olduğundan emin olun
- Sandbox/Production URI'sini kontrol edin

## 📚 Teknolojiler

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js v5
- **Payment:** iyzico
- **UI:** Tailwind CSS
- **Type Safety:** TypeScript
- **State Management:** Zustand
- **Notifications:** Sonner

## 📄 Lisans

Bu proje özel bir projedir.

## 🤝 Destek

Sorun yaşarsanız:
1. Console log'larını kontrol edin
2. Prisma Studio ile veritabanını kontrol edin: `npm run db:studio`
3. Build log'larını inceleyin: `npm run build`

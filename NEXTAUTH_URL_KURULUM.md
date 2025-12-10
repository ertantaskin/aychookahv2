# NEXTAUTH_URL Yapılandırması

## Port Belirtme Kuralları

### ✅ Standart Portlar (Port Belirtmeye Gerek YOK)

**HTTP (Port 80):**
```
NEXTAUTH_URL="http://example.com"
```

**HTTPS (Port 443):**
```
NEXTAUTH_URL="https://example.com"
```

### ⚠️ Özel Portlar (Port Belirtilmeli)

Eğer standart olmayan bir port kullanıyorsanız:

```
NEXTAUTH_URL="https://example.com:3000"
NEXTAUTH_URL="https://example.com:8080"
```

## Production Ortamı İçin

### Vercel, Netlify, Railway gibi Platformlar:
- **Port belirtmeye GEREK YOK**
- Platform otomatik olarak HTTPS (443) kullanır
- Örnek: `NEXTAUTH_URL="https://yourdomain.com"`

### Kendi Sunucunuz (Nginx/Apache Reverse Proxy):
- **Port belirtmeye GEREK YOK**
- Reverse proxy standart portları kullanır
- Örnek: `NEXTAUTH_URL="https://yourdomain.com"`

### Docker Container (Port Mapping):
- **Port belirtmeye GEREK YOK** (eğer reverse proxy varsa)
- Eğer direkt container'a bağlanıyorsanız port belirtin
- Örnek: `NEXTAUTH_URL="https://yourdomain.com:3000"`

## Örnek Yapılandırmalar

### Production (Vercel):
```env
NEXTAUTH_URL="https://aychookah.com"
NEXT_PUBLIC_APP_URL="https://aychookah.com"
```

### Production (Kendi Sunucu - Nginx):
```env
NEXTAUTH_URL="https://aychookah.com"
NEXT_PUBLIC_APP_URL="https://aychookah.com"
```

### Development:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Staging (Özel Port):
```env
NEXTAUTH_URL="https://staging.aychookah.com:8443"
NEXT_PUBLIC_APP_URL="https://staging.aychookah.com:8443"
```

## Önemli Notlar

1. **HTTPS Kullanın**: Production'da mutlaka HTTPS kullanın
2. **Trailing Slash YOK**: URL'in sonunda `/` olmamalı
3. **Protocol Belirtin**: `http://` veya `https://` mutlaka belirtilmeli
4. **Subdomain**: Subdomain kullanıyorsanız tam subdomain'i yazın
   - ✅ `https://www.aychookah.com`
   - ✅ `https://admin.aychookah.com`
   - ❌ `aychookah.com` (protocol eksik)

## Sorun Giderme

### Giriş Çalışmıyor:
1. `NEXTAUTH_URL` değerini kontrol edin
2. Browser console'da hata mesajlarını kontrol edin
3. Network tab'da `/api/auth/*` isteklerini kontrol edin
4. CORS hataları varsa `trustHost: true` ayarını kontrol edin

### Callback URL Hatası:
- NextAuth callback URL'i otomatik olarak `NEXTAUTH_URL` + `/api/auth/callback/[provider]` olarak oluşturur
- Eğer özel bir callback URL gerekiyorsa, provider yapılandırmasında belirtin



"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getGuestCartItemCount } from "@/lib/utils/cart-client";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const pathname = usePathname();

  // Admin sayfalarında header'ı gösterme (hooks'tan sonra kontrol et)
  const isAdminPage = pathname?.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Client-side mount kontrolü (hydration hatasını önlemek için)
  useEffect(() => {
    setIsMounted(true);
    // Mount olduktan sonra guest sepet sayısını set et
    const guestCount = getGuestCartItemCount();
    setCartItemCount(guestCount);
  }, []);

  // Kullanıcı session'ını ve sepet sayısını güncelle (mount olduğunda ve pathname değiştiğinde)
  useEffect(() => {
    if (!isMounted) return;

    let isCancelled = false;

    const updateSessionAndCart = async () => {
      try {
        // Session kontrolü - cache bypass için timestamp ekle
        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        if (isCancelled) return;
        
        const sessionData = await sessionResponse.json();
        if (!isCancelled) {
          setUser(sessionData.user);
        }

        // Sepet sayısını güncelle
        if (sessionData.user) {
          // Authenticated kullanıcı için API'den güncel sayıyı al
          try {
            const cartResponse = await fetch("/api/cart/count", {
              cache: "no-store",
            });
            if (isCancelled) return;
            
            const cartData = await cartResponse.json();
            // Sadece API'den geçerli bir sayı geldiyse güncelle
            if (!isCancelled && cartData.count !== undefined && cartData.count !== null && typeof cartData.count === 'number') {
              setCartItemCount(cartData.count);
            }
          } catch {
            // API hatası durumunda guest sepet sayısını koru
            if (!isCancelled) {
              const currentGuestCount = getGuestCartItemCount();
              setCartItemCount(currentGuestCount);
            }
          }
        } else {
          // Guest kullanıcı için localStorage'dan güncel sayıyı al
          if (!isCancelled) {
            const currentGuestCount = getGuestCartItemCount();
            setCartItemCount(currentGuestCount);
          }
        }
      } catch {
        // Hata durumunda guest sepet sayısını al
        if (!isCancelled) {
          const currentGuestCount = getGuestCartItemCount();
          setCartItemCount(currentGuestCount);
        }
      }
    };

    updateSessionAndCart();

    return () => {
      isCancelled = true;
    };
  }, [isMounted, pathname]);

  // Sepet güncellendiğinde sayıyı güncelle (sadece cartUpdated event'inde)
  useEffect(() => {
    if (!isMounted) return;

    let isCancelled = false;

    const handleCartUpdate = () => {
      if (isCancelled) return;
      
      // Önce guest sepet sayısını al (optimistic update - hızlı)
        const guestCount = getGuestCartItemCount();
        if (!isCancelled) {
          setCartItemCount(guestCount);
        }
      
      // Eğer user state'i varsa, authenticated kullanıcı için API'den güncel sayıyı al
      if (user) {
        fetch("/api/cart/count", {
          cache: "no-store",
        })
          .then(res => res.json())
          .then(cartData => {
            if (isCancelled) return;
            
            if (cartData.count !== undefined && cartData.count !== null && typeof cartData.count === 'number') {
                setCartItemCount(cartData.count);
              }
          })
          .catch(() => {
            // API hatası durumunda guest sepet sayısı zaten set edilmiş
          });
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    
    return () => {
      isCancelled = true;
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [isMounted, user]);

  const navigation = [
    { 
      name: "Ana Sayfa", 
      href: "/",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: "Ürünler", 
      href: "/urunler",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    { 
      name: "Hakkımızda", 
      href: "/hakkimizda",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: "İletişim", 
      href: "/iletisim",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
  ];

  const socialLinks = [
    { name: "Instagram", icon: "instagram", href: "#" },
    { name: "Facebook", icon: "facebook", href: "#" },
    { name: "WhatsApp", icon: "whatsapp", href: "#" },
  ];

  // Admin sayfalarında header'ı gösterme (hooks'tan sonra kontrol et)
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-luxury-black/95 backdrop-blur-md border-b border-luxury-goldLight/10 shadow-lg" 
            : "bg-luxury-black/80 backdrop-blur-sm"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group relative">
              <div className="relative">
                <Image 
                  src="/images/logo/ayc-hookah-logo.png"
                  width={200}
                  height={64} 
                  alt="AYC HOOKAH Logo" 
                  className="h-14 md:h-16 w-auto transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-luxury-goldLight transition-all duration-300 group-hover:w-full" />
              </div>
            </Link>

            {/* Desktop Navigation - Clean Design */}
            <div className="hidden lg:flex items-center">
              <nav className="flex items-center space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative text-sm font-medium transition-all duration-300 ${
                      pathname === item.href
                        ? "text-luxury-goldLight"
                        : "text-luxury-lightGray hover:text-white"
                    }`}
                  >
                    <span className="relative z-10">{item.name}</span>
                    {pathname === item.href && (
                      <div className="absolute -bottom-1 left-0 right-0 h-px bg-luxury-goldLight" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Desktop Actions - Sepet, Kullanıcı ve Menu */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Sepet İkonu */}
              <Link
                href="/sepet"
                className="relative flex items-center justify-center w-10 h-10 text-luxury-lightGray hover:text-luxury-goldLight transition-colors"
                aria-label="Sepet"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-luxury-goldLight text-luxury-black text-xs font-bold rounded-full">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Kullanıcı İkonu */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  if (isCheckingSession) return;
                  
                  setIsCheckingSession(true);
                  try {
                    // Önce mevcut user state'ini kontrol et
                    if (user) {
                      window.location.href = "/hesabim";
                      return;
                    }
                    
                    // Eğer user state'i yoksa, session kontrolü yap
                    const sessionResponse = await fetch("/api/auth/session");
                    const sessionData = await sessionResponse.json();
                    
                    if (sessionData.user) {
                      window.location.href = "/hesabim";
                    } else {
                      window.location.href = "/giris";
                    }
                  } catch (error) {
                    console.error("Session check error:", error);
                    window.location.href = "/giris";
                  } finally {
                    setIsCheckingSession(false);
                  }
                }}
                className="flex items-center justify-center w-10 h-10 text-luxury-lightGray hover:text-luxury-goldLight transition-colors disabled:opacity-50 disabled:cursor-wait"
                aria-label={user ? "Hesabım" : "Giriş Yap"}
                title={user ? (user.name || user.email) : "Giriş Yap"}
                disabled={isCheckingSession}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Desktop Menu Button (for flyout on all screens) */}
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border border-luxury-goldLight/30 rounded-full text-luxury-goldLight hover:bg-luxury-goldLight hover:text-luxury-black transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="text-sm font-medium uppercase tracking-wider">Menu</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Mobile Sepet, Kullanıcı ve Menu Buttons */}
            <div className="lg:hidden flex items-center gap-3">
              {/* Sepet İkonu - Mobile */}
              <Link
                href="/sepet"
                className="relative flex items-center justify-center w-10 h-10 text-luxury-lightGray hover:text-luxury-goldLight transition-colors"
                aria-label="Sepet"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-luxury-goldLight text-luxury-black text-xs font-bold rounded-full">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Kullanıcı İkonu - Mobile */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  if (isCheckingSession) return;
                  
                  setIsCheckingSession(true);
                  try {
                    // Önce mevcut user state'ini kontrol et
                    if (user) {
                      window.location.href = "/hesabim";
                      return;
                    }
                    
                    // Eğer user state'i yoksa, session kontrolü yap
                    const sessionResponse = await fetch("/api/auth/session");
                    const sessionData = await sessionResponse.json();
                    
                    if (sessionData.user) {
                      window.location.href = "/hesabim";
                    } else {
                      window.location.href = "/giris";
                    }
                  } catch (error) {
                    console.error("Session check error:", error);
                    window.location.href = "/giris";
                  } finally {
                    setIsCheckingSession(false);
                  }
                }}
                className="flex items-center justify-center w-10 h-10 text-luxury-lightGray hover:text-luxury-goldLight transition-colors disabled:opacity-50 disabled:cursor-wait"
                aria-label={user ? "Hesabım" : "Giriş Yap"}
                title={user ? (user.name || user.email) : "Giriş Yap"}
                disabled={isCheckingSession}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

            {/* Menu Button */}
            <button
              type="button"
                className="relative w-10 h-10 flex items-center justify-center text-luxury-lightGray hover:text-luxury-goldLight transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menüyü aç/kapat"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Flyout Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-luxury-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Flyout Menu Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-luxury-black z-50 transform transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Menu Header */}
          <div className="flex justify-between items-center p-6 border-b border-luxury-goldLight/10">
            <Image 
              src="/images/logo/ayc-hookah-logo.png" 
              alt="AYC HOOKAH Logo" 
              width={200}
              height={48}
              className="h-12 w-auto"
            />
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center text-luxury-lightGray hover:text-luxury-goldLight transition-colors"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Menüyü kapat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Content - Scrollable */}
          <div className="flex-1 overflow-y-auto py-6 px-6">
            {/* Navigation Links - Stacked */}
            <nav className="space-y-2">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                    pathname === item.href
                      ? "bg-luxury-goldLight/10 text-luxury-goldLight"
                      : "text-luxury-lightGray hover:bg-luxury-darkGray hover:text-white"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    pathname === item.href ? "text-luxury-goldLight" : ""
                  }`}>
                    {item.icon}
                  </div>
                  <span className="text-lg font-semibold tracking-wide">{item.name}</span>
                  <svg 
                    className={`ml-auto w-5 h-5 transition-transform duration-300 ${
                      pathname === item.href ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="my-8 border-t border-luxury-goldLight/10" />

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="font-sans text-xs font-semibold text-luxury-lightGray uppercase tracking-wider mb-4">
                Hızlı İşlemler
              </h3>
              <Link
                href="/urunler"
                className="flex items-center gap-3 p-3 rounded-lg bg-luxury-darkGray/50 hover:bg-luxury-goldLight/10 text-luxury-lightGray hover:text-luxury-goldLight transition-all duration-300 group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm font-medium">Ürün Ara</span>
              </Link>
              <Link
                href="/iletisim"
                className="flex items-center gap-3 p-3 rounded-lg bg-luxury-darkGray/50 hover:bg-luxury-goldLight/10 text-luxury-lightGray hover:text-luxury-goldLight transition-all duration-300 group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="text-sm font-medium">Destek Talebi</span>
              </Link>
            </div>
          </div>

          {/* Menu Footer - Actions */}
          <div className="border-t border-luxury-goldLight/10 p-6 space-y-6 bg-luxury-darkGray/30">
            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="tel:+90XXXXXXXXXX" 
                className="flex items-center gap-3 text-luxury-lightGray hover:text-luxury-goldLight transition-colors group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm">+90 XXX XXX XX XX</span>
              </a>
              <a 
                href="mailto:info@aychookah.com" 
                className="flex items-center gap-3 text-luxury-lightGray hover:text-luxury-goldLight transition-colors group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">info@aychookah.com</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-semibold text-luxury-lightGray uppercase tracking-wider">
                Bizi Takip Edin
              </h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-luxury-darkGray hover:bg-luxury-goldLight text-luxury-lightGray hover:text-luxury-black transition-all duration-300 hover:scale-110"
                    aria-label={social.name}
                  >
                    {social.icon === "instagram" && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                        <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    )}
                    {social.icon === "facebook" && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    {social.icon === "whatsapp" && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href="/urunler"
              className="block w-full py-3 text-center bg-luxury-goldLight text-luxury-black font-bold rounded-lg hover:bg-luxury-gold transition-all duration-300 uppercase tracking-wider text-sm hover:scale-105 transform shadow-lg"
            >
              Ürünleri İncele
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;


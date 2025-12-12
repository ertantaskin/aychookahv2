"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PaymentIframeClientProps {
  token: string;
  checkoutFormContent?: string;
}

declare global {
  interface Window {
    Iyzipay: any;
    iyziInit: any;
  }
}

export default function PaymentIframeClient({
  token,
  checkoutFormContent,
}: PaymentIframeClientProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Önceki iframe'i temizle
    const container = iframeRef.current || document.getElementById("iyzipay-checkout-form");
    if (container) {
      container.innerHTML = "";
    }
    
    // Eski script'leri temizle (iyzipay script'leri)
    const existingScripts = document.querySelectorAll('script[src*="iyzipay"]');
    existingScripts.forEach(script => {
      // Script'i kaldırma, sadece işaretle
      console.log("Found existing iyzico script, will reuse");
    });
    
    // window.Iyzipay ve window.iyziInit'i temizle (yeniden başlatmak için)
    if (typeof window !== "undefined") {
      delete (window as any).Iyzipay;
      delete (window as any).iyziInit;
    }

    // Container'ın hazır olmasını bekle
    const waitForContainer = (callback: () => void, maxAttempts = 100) => {
      let attempts = 0;
      const checkContainer = () => {
        attempts++;
        // Hem ref hem de DOM'dan kontrol et
        const container = iframeRef.current || document.getElementById("iyzipay-checkout-form");
        if (container) {
          console.log("Container found after", attempts, "attempts");
          callback();
        } else if (attempts < maxAttempts) {
          setTimeout(checkContainer, 50); // 50ms aralıklarla kontrol et (toplam 5 saniye)
        } else {
          console.error("Container not found after", maxAttempts, "attempts");
          console.error("iframeRef.current:", iframeRef.current);
          console.error("document.getElementById:", document.getElementById("iyzipay-checkout-form"));
          if (isMounted) {
            setError("Ödeme formu container'ı bulunamadı. Lütfen sayfayı yenileyin.");
            setIsLoading(false);
          }
        }
      };
      // İlk kontrol için kısa bir gecikme - React'in render döngüsünü bekle
      setTimeout(checkContainer, 100);
    };

    // checkoutFormContent'i sessionStorage'dan al (eğer prop olarak gelmediyse)
    // Ama önce eski içeriği temizle - yeni ödeme için
    const storedContent = typeof window !== "undefined" 
      ? sessionStorage.getItem("iyzico_checkoutFormContent") 
      : null;
    
    // Eğer storedContent varsa ve token değiştiyse, eski içeriği temizle
    if (storedContent && typeof window !== "undefined") {
      const storedToken = sessionStorage.getItem("iyzico_token");
      if (storedToken !== token) {
        console.log("Token changed, clearing old checkoutFormContent");
        sessionStorage.removeItem("iyzico_checkoutFormContent");
        sessionStorage.removeItem("iyzico_token");
      }
    }
    
    const formContent = checkoutFormContent || storedContent;

    console.log("Form content available:", !!formContent);
    console.log("Stored content available:", !!storedContent);

    // checkoutFormContent varsa, onu kullan (iyzico'nun önerdiği yöntem)
    if (formContent) {
      console.log("Using checkoutFormContent from iyzico");
      console.log("Form content length:", formContent.length);
      
      // Container'ın hazır olmasını bekle
      waitForContainer(() => {
        const container = iframeRef.current || document.getElementById("iyzipay-checkout-form");
        if (!container || !isMounted) {
          console.error("Container still not available after wait");
          return;
        }

        console.log("Container found, injecting content");
        
        // Container'ı temizle
        container.innerHTML = "";
        
        // checkoutFormContent bir script içeriyor
        // innerHTML ile script eklemek script'leri çalıştırmaz
        // Script'leri ayrı ayrı execute etmemiz gerekiyor
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = formContent;
        
        // Önce tüm script'leri topla
        const scripts = tempDiv.querySelectorAll("script");
        const nonScriptContent = tempDiv.innerHTML.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        
        // Non-script içeriği ekle
        container.innerHTML = nonScriptContent;
        
        console.log("Found", scripts.length, "script tags");
        
        // Script'leri sırayla execute et
        let scriptIndex = 0;
        const executeScripts = () => {
          if (scriptIndex >= scripts.length) {
            console.log("All scripts executed");
            // Script'ler yüklendikten sonra kontrol et
            setTimeout(() => {
              checkFormLoaded();
            }, 500);
            return;
          }
          
          const script = scripts[scriptIndex];
          const newScript = document.createElement("script");
          
          // Script'in src attribute'u varsa
          if (script.src) {
            newScript.src = script.src;
            newScript.async = script.async || false;
            newScript.defer = script.defer || false;
            newScript.onload = () => {
              scriptIndex++;
              executeScripts();
            };
            newScript.onerror = () => {
              console.error("Script load error:", script.src);
              scriptIndex++;
              executeScripts();
            };
            document.head.appendChild(newScript);
          } else {
            // Inline script
            newScript.textContent = script.textContent;
            document.head.appendChild(newScript);
            // Inline script'ler hemen çalışır
            scriptIndex++;
            executeScripts();
          }
        };
        
        // Script'leri execute et
        executeScripts();
        
        // Form yükleme kontrolü
        const checkFormLoaded = () => {
          if (!isMounted) return;
          
          let checkCount = 0;
          const maxChecks = 60; // 30 saniye (60 * 500ms)
          let checkInterval: NodeJS.Timeout | null = null;
          
          // İlk kontrol için kısa bir gecikme
          setTimeout(() => {
            if (!isMounted) return;
            
            checkInterval = setInterval(() => {
              checkCount++;
              
              // Container içinde iframe veya form oluşmuş mu kontrol et
              const hasIframe = container.querySelector("iframe");
              const hasForm = container.querySelector("form");
              const hasDiv = container.querySelector("div");
              
              // iyziInit veya Iyzipay kontrolü
              const hasIyziInit = !!window.iyziInit;
              const hasIyzipay = !!window.Iyzipay;
              
              // Her 5 kontrolte bir log
              if (checkCount % 5 === 0) {
                console.log(`Checking for iyziInit/Iyzipay/iframe (${checkCount}/${maxChecks})...`);
                console.log("window.iyziInit:", hasIyziInit);
                console.log("window.Iyzipay:", hasIyzipay);
                console.log("hasIframe:", !!hasIframe);
                console.log("hasForm:", !!hasForm);
                console.log("hasDiv:", !!hasDiv);
                console.log("Container HTML length:", container.innerHTML.length);
              }
              
              // Eğer iframe, form veya iyzico script'leri yüklendiyse
              if ((hasIyziInit || hasIyzipay || hasIframe || hasForm) && isMounted) {
                console.log("Payment form loaded successfully");
                if (checkInterval) clearInterval(checkInterval);
                setIsLoading(false);
                // sessionStorage'dan temizle
                if (typeof window !== "undefined") {
                  sessionStorage.removeItem("iyzico_checkoutFormContent");
                  sessionStorage.removeItem("iyzico_token");
                }
              } else if (checkCount >= maxChecks) {
                console.error("Payment form not loaded after timeout");
                if (checkInterval) clearInterval(checkInterval);
                if (isMounted) {
                  // Container'da bir şey var mı kontrol et
                  const containerHTML = container.innerHTML;
                  console.log("Container content length:", containerHTML.length);
                  console.log("Container content preview:", containerHTML.substring(0, 500));
                  
                  // Eğer container'da içerik varsa, loading'i kapat
                  if (containerHTML.trim().length > 100) {
                    console.log("Container has content, hiding loading");
                    setIsLoading(false);
                  } else {
                    setError("Ödeme formu yüklenemedi. Lütfen sayfayı yenileyin.");
                    setIsLoading(false);
                  }
                }
              }
            }, 500);
          }, 1000);
        };
      
        // Script yüklendikten sonra kontrol et - daha uzun timeout
        let checkCount = 0;
        const maxChecks = 40; // 20 saniye (40 * 500ms)
        let checkInterval: NodeJS.Timeout | null = null;
        
        // İlk kontrol için kısa bir gecikme
        setTimeout(() => {
          if (!isMounted) return;
          
          checkInterval = setInterval(() => {
            checkCount++;
            
            // Container içinde iframe veya form oluşmuş mu kontrol et
            const hasIframe = container.querySelector("iframe");
            const hasForm = container.querySelector("form");
            const hasDiv = container.querySelector("div");
            
            // iyziInit veya Iyzipay kontrolü
            const hasIyziInit = !!window.iyziInit;
            const hasIyzipay = !!window.Iyzipay;
            
            // Her 5 kontrolte bir log
            if (checkCount % 5 === 0) {
              console.log(`Checking for iyziInit/Iyzipay/iframe (${checkCount}/${maxChecks})...`);
              console.log("window.iyziInit:", hasIyziInit);
              console.log("window.Iyzipay:", hasIyzipay);
              console.log("hasIframe:", !!hasIframe);
              console.log("hasForm:", !!hasForm);
              console.log("hasDiv:", !!hasDiv);
            }
            
            // Eğer iframe, form veya iyzico script'leri yüklendiyse
            if ((hasIyziInit || hasIyzipay || hasIframe || hasForm) && isMounted) {
              console.log("Payment form loaded successfully");
              if (checkInterval) clearInterval(checkInterval);
              setIsLoading(false);
              // sessionStorage'dan temizle
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("iyzico_checkoutFormContent");
              }
            } else if (checkCount >= maxChecks) {
              console.error("Payment form not loaded after timeout");
              if (checkInterval) clearInterval(checkInterval);
              if (isMounted) {
                // Container'da bir şey var mı kontrol et
                const containerHTML = container.innerHTML;
                console.log("Container content length:", containerHTML.length);
                console.log("Container content preview:", containerHTML.substring(0, 300));
                
                // Eğer container'da içerik varsa, loading'i kapat
                if (containerHTML.trim().length > 0) {
                  console.log("Container has content, hiding loading");
                  setIsLoading(false);
                } else {
                  setError("Ödeme formu yüklenemedi. Lütfen sayfayı yenileyin.");
                  setIsLoading(false);
                }
              }
            }
          }, 500);
        }, 1000); // İlk kontrol için 1 saniye bekle
      });
      
      return () => {
        // Cleanup will be handled by the waitForContainer callback
      };
    }

    // Fallback: Eski yöntem (manuel script yükleme)
    console.log("Using manual script loading method");
    let checkInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadScript = () => {
      // Script zaten yüklenmiş mi kontrol et
      if (window.Iyzipay) {
        console.log("Iyzipay already loaded");
        if (isMounted) {
          initializeIframe();
        }
        return;
      }

      // Script zaten DOM'da mı kontrol et
      const existingScript = document.querySelector(
        'script[src*="iyzipay"]'
      );

      if (existingScript) {
        console.log("Script already in DOM, waiting for load...");
        checkInterval = setInterval(() => {
          if (window.Iyzipay && isMounted) {
            if (checkInterval) clearInterval(checkInterval);
            initializeIframe();
          }
        }, 100);

        timeoutId = setTimeout(() => {
          if (checkInterval) clearInterval(checkInterval);
          if (!window.Iyzipay && isMounted) {
            console.error("Iyzipay SDK yüklenemedi - existing script timeout");
            setError("Ödeme formu kütüphanesi yüklenemedi. Lütfen sayfayı yenileyin.");
            setIsLoading(false);
            toast.error("Ödeme formu kütüphanesi yüklenemedi");
          }
        }, 10000);

        return;
      }

      // Yeni script oluştur ve yükle
      console.log("Loading iyzico script...");
      const script = document.createElement("script");
      script.src = "https://cdn.iyzipay.com/bower/iyzipay-js/dist/iyzipay.min.js";
      script.async = true;
      script.id = "iyzipay-script";
      script.type = "text/javascript";

      script.onload = () => {
        console.log("Script loaded, checking for Iyzipay...");
        setTimeout(() => {
          if (window.Iyzipay && isMounted) {
            console.log("Iyzipay found, initializing iframe...");
            initializeIframe();
          } else if (isMounted) {
            console.log("Waiting for Iyzipay to be available...");
            checkInterval = setInterval(() => {
              if (window.Iyzipay && isMounted) {
                if (checkInterval) clearInterval(checkInterval);
                initializeIframe();
              }
            }, 50);

            timeoutId = setTimeout(() => {
              if (checkInterval) clearInterval(checkInterval);
              if (!window.Iyzipay && isMounted) {
                console.error("Iyzipay SDK yüklenemedi - timeout");
                setError("Ödeme formu kütüphanesi yüklenemedi. Lütfen sayfayı yenileyin veya farklı bir tarayıcı deneyin.");
                setIsLoading(false);
                toast.error("Ödeme formu kütüphanesi yüklenemedi");
              }
            }, 5000);
          }
        }, 300);
      };

      script.onerror = (error) => {
        console.error("Script load error:", error);
        if (isMounted) {
          setError("Ödeme formu script'i yüklenemedi. Lütfen internet bağlantınızı kontrol edin ve sayfayı yenileyin.");
          setIsLoading(false);
          toast.error("Ödeme formu yüklenemedi");
        }
      };

      document.head.appendChild(script);
    };

    loadScript();

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };

    function initializeIframe() {
      console.log("Initializing iframe with token:", token);
      
      if (!token || token.trim() === "") {
        console.error("Token is missing or empty");
        setError("Ödeme token'ı bulunamadı. Lütfen ödeme sayfasına geri dönün.");
        setIsLoading(false);
        router.push("/odeme?error=missing_token");
        return;
      }

      if (!iframeRef.current) {
        console.error("Iframe container not found");
        setError("Ödeme formu container'ı bulunamadı");
        setIsLoading(false);
        return;
      }

      if (!window.Iyzipay) {
        console.error("Iyzipay not loaded");
        setError("Ödeme formu kütüphanesi yüklenemedi");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Creating Iyzipay instance...");
        const iyzipay = new window.Iyzipay();
        console.log("Iyzipay instance created:", iyzipay);

        const container = document.getElementById("iyzipay-checkout-form");
        if (container) {
          container.innerHTML = "";
        }

        console.log("Initializing checkout form...");
        iyzipay.checkoutForm({
          locale: "tr",
          token: token,
          iframeContainer: "#iyzipay-checkout-form",
          successCallback: function (response: any) {
            console.log("Payment success:", response);
            const callbackToken = response.token || token;
            router.push(`/odeme/callback?token=${callbackToken}`);
          },
          failureCallback: function (response: any) {
            console.error("Payment failure:", response);
            const errorMessage = response.errorMessage || response.error || "Ödeme başarısız";
            toast.error(errorMessage);
            router.push(`/odeme?error=${encodeURIComponent(errorMessage)}`);
          },
        });

        console.log("Checkout form initialized");
        setIsLoading(false);
      } catch (error: any) {
        console.error("iyzico iframe initialization error:", error);
        setError(error.message || "Ödeme formu başlatılamadı");
        setIsLoading(false);
        toast.error("Ödeme formu başlatılamadı");
      }
    }
  }, [token, checkoutFormContent, router]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-sans font-bold text-luxury-black mb-6">
          Ödeme İşlemi
        </h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {isLoading && !error && (
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-goldLight mx-auto mb-4"></div>
                <p className="text-gray-600 font-sans">Ödeme formu yükleniyor...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="text-center">
                <p className="text-red-600 font-sans mb-4">{error}</p>
                <button
                  onClick={() => router.push("/odeme")}
                  className="px-6 py-3 bg-luxury-goldLight text-luxury-black font-sans font-semibold rounded-lg hover:bg-luxury-gold transition-all"
                >
                  Ödeme Sayfasına Dön
                </button>
              </div>
            </div>
          )}
          {/* Container her zaman render edilmeli - ref için gerekli */}
          <div
            ref={iframeRef}
            id="iyzipay-checkout-form"
            className={`w-full min-h-[600px] ${isLoading && !error ? 'hidden' : ''}`}
          />
        </div>
      </div>
    </div>
  );
}


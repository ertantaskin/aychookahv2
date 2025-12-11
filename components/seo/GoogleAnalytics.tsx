"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

interface GoogleAnalyticsProps {
  analyticsId?: string | null;
}

export default function GoogleAnalytics({ analyticsId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sayfa değişikliklerini takip et
  useEffect(() => {
    if (!analyticsId) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("config", analyticsId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, analyticsId]);

  if (!analyticsId) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${analyticsId}', {
              page_path: window.location.pathname + window.location.search,
            });
          `,
        }}
      />
    </>
  );
}

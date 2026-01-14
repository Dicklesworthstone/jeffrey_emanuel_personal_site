"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

type GoogleAnalyticsProps = {
  gaId: string;
};

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  // Initialize GA on mount (avoids Script component minification bug)
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!gaId || gaId === "") return;
    if (initialized.current) return;

    initialized.current = true;

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: Parameters<typeof window.gtag>) {
      window.dataLayer.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId, {
      page_path: window.location.pathname,
      anonymize_ip: true,
    });

    // Load the GA script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);
  }, [gaId]);

  // Track page views on route change
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!pathname || !window.gtag) return;

    window.gtag("config", gaId, {
      page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
    });
  }, [pathname, searchParams, gaId]);

  return null;
}

// Add type definitions for window.gtag and dataLayer
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (
      command: "config" | "event" | "js",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

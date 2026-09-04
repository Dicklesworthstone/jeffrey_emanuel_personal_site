"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

type GoogleAnalyticsProps = {
  gaId: string;
};

// ISO 3166-1 alpha-2 codes for the EEA (EU-27 + IS, LI, NO), the UK and
// Switzerland — the jurisdictions where analytics cookies need prior consent.
const CONSENT_DENIED_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE", "IS", "LI", "NO", "GB", "CH",
];

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

    // Consent Mode v2 defaults, set before the tag loads. Visitors in the
    // EEA/UK/CH get analytics storage denied (GA then sends cookieless,
    // modelled pings only); everyone else keeps standard analytics. Ad
    // storage is denied everywhere — this site runs no ads. There is no
    // consent banner, so nothing ever upgrades these defaults; that is the
    // deliberate, minimal-data posture rather than a placeholder.
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      region: CONSENT_DENIED_REGIONS,
    });
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });
    window.gtag("js", new Date());
    // Config will be called by the page view effect

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
      command: "config" | "event" | "js" | "consent",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

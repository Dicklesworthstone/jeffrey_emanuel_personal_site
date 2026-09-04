import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/content";
import ClientShell from "@/components/client-shell";
import { GoogleAnalytics } from "@/components/analytics";

import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

function getMetadataBaseUrl(): URL {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!rawSiteUrl) {
    return new URL("https://jeffreyemanuel.com");
  }

  try {
    return new URL(rawSiteUrl);
  } catch {
    return new URL("https://jeffreyemanuel.com");
  }
}

// Viewport configuration for mobile optimization
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // For iPhone X+ notch
  // A single (media-less) tag: the theme is chosen by the site's own toggle,
  // not the OS, and ThemeProvider rewrites this value when it changes.
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: getMetadataBaseUrl(),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jeffrey Emanuel",
  },
  formatDetection: {
    telephone: false, // Prevent auto-linking phone numbers
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/rss.xml", title: "Jeffrey Emanuel - RSS Feed" },
      ],
    },
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    siteName: "Jeffrey Emanuel",
  },
  twitter: {
    card: "summary_large_image",
    site: "@doodlestein",
    creator: "@doodlestein",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <html lang="en" className="scroll-smooth bg-slate-950 text-slate-100" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        {/* Google Analytics - only when a measurement ID is configured, so a
            build without GA opens no idle sockets to Google. */}
        {gaId && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
            <link rel="preconnect" href="https://www.google-analytics.com" />
            <link rel="dns-prefetch" href="https://www.google-analytics.com" />
          </>
        )}
        {/* GitHub for project links and avatars */}
        <link rel="dns-prefetch" href="https://github.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
        {/* Pre-paint theme stamp. Runs synchronously so a light-mode visitor
            never sees a dark first frame. Dark is the default for everyone;
            only an explicitly stored "light" opts in (never the OS setting).
            Must stay in lockstep with resolveStoredTheme() in theme-provider. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t="dark";try{if(localStorage.getItem("theme")==="light")t="light"}catch(e){}document.documentElement.classList.add(t);if(t==="light"){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#f8fafc")}})();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${sourceSerif.variable} flex min-h-screen flex-col bg-slate-950 text-slate-100 antialiased`}
        suppressHydrationWarning
      >
        {/* Skip link for keyboard navigation accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Suspense fallback={null}>
          <GoogleAnalytics gaId={gaId} />
        </Suspense>
        <ThemeProvider>
          <ClientShell>{children}</ClientShell>
        </ThemeProvider>
      </body>
    </html>
  );
}

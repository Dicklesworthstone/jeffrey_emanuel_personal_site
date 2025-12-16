import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/content";
import ClientShell from "@/components/client-shell";
import { GoogleAnalytics } from "@/components/analytics";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

// Viewport configuration for mobile optimization
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // For iPhone X+ notch
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
    { media: "(prefers-color-scheme: light)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL("https://jeffreyemanuel.com"),
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
    title: siteConfig.title,
    description: siteConfig.description,
    url: "https://jeffreyemanuel.com",
    siteName: "Jeffrey Emanuel",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: "@doodlestein",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <html lang="en" className="h-full scroll-smooth bg-slate-950 text-slate-100">
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body
        className={`${inter.variable} ${sourceSerif.variable} flex min-h-screen flex-col bg-slate-950 text-slate-100 antialiased`}
      >
        {/* Skip link for keyboard navigation accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <GoogleAnalytics gaId={gaId} />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/content";
import ClientShell from "@/components/client-shell";
import { GoogleAnalytics } from "@/components/analytics";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jeffrey Emanuel",
  },
  formatDetection: {
    telephone: false, // Prevent auto-linking phone numbers
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
      <body
        className={`${inter.variable} flex min-h-screen flex-col bg-slate-950 text-slate-100 antialiased`}
      >
        <GoogleAnalytics gaId={gaId} />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}

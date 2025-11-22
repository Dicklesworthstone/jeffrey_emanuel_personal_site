import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/content";
import ClientShell from "@/components/client-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL("https://jeffreyemanuel.com"),
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
  return (
    <html lang="en" className="h-full scroll-smooth bg-slate-950 text-slate-100">
      <body
        className={`${inter.variable} flex min-h-screen flex-col bg-slate-950 text-slate-100 antialiased`}
      >
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}

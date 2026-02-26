import type { Metadata } from "next";

// Private implementation module for /offline route wrappers.
export const metadata: Metadata = {
  title: "Offline | Jeffrey Emanuel",
  description: "You are currently offline. Reconnect to load Jeffrey Emanuel's website.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/offline",
  },
};

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ErrorBoundary from "@/components/error-boundary";
import ScrollToTop from "@/components/scroll-to-top";
import { useMobileOptimizations } from "@/hooks/use-mobile-optimizations";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Enable mobile-specific optimizations
  useMobileOptimizations();

  useEffect(() => {
    // Smooth scroll to top with mobile-friendly behavior
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex-1"
          >
            {children}
          </motion.main>
        </AnimatePresence>
        <SiteFooter />
        <ScrollToTop />
      </div>
    </ErrorBoundary>
  );
}

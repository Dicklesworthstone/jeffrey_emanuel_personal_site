"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console (or reporting service)
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100">
      <body className={`${inter.variable} ${sourceSerif.variable} flex h-full flex-col items-center justify-center font-sans antialiased`}>
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 text-red-400 shadow-2xl shadow-red-500/10">
              <AlertTriangle className="h-10 w-10" />
            </div>
          </div>
          
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white">
            Something went wrong
          </h1>

          <p className="mb-8 text-slate-400">
            The page failed to render. Trying again usually fixes it; if it
            doesn&apos;t, the home page always works.
          </p>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-slate-950 shadow-lg transition-colors hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3 font-semibold text-slate-100 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Back to home
            </Link>
            
            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-400">Error Details</p>
                <pre className="overflow-auto text-xs text-slate-400 font-mono">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}

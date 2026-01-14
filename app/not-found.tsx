"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import SectionShell from "@/components/section-shell";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <SectionShell
        title="Page not found"
        eyebrow="404 Error"
        kicker="The page you are looking for doesn't exist. It might have been moved, deleted, or never existed in the first place."
        icon={Search}
      >
        <div className="flex flex-col gap-4 sm:flex-row pt-8">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-100 px-8 text-sm font-semibold text-slate-900 transition-all hover:bg-white hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/writing"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-8 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:text-white hover:scale-105 active:scale-95"
          >
            Read some essays
          </Link>
        </div>
      </SectionShell>
    </div>
  );
}

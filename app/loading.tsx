import { Zap } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="relative flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30">
            <Zap className="h-6 w-6 text-white animate-pulse" />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-slate-400 animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}
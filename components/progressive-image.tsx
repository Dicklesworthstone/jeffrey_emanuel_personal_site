"use client";

import Image from "next/image";
import { useState } from "react";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Progressive image component with blur-up effect
 * Shows a blurred placeholder while the full image loads
 */
export default function ProgressiveImage({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  className = "",
  priority = false,
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={`transition-all duration-500 ${
          isLoading ? "scale-110 blur-md" : "scale-100 blur-0"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-slate-900/50 animate-pulse" />
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-xs text-slate-400">
          Failed to load image
        </div>
      )}
    </div>
  );
}

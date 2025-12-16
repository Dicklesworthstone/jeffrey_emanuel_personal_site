"use client";

import Link from "next/link";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof Link>;
type AnchorProps = ComponentProps<"a">;

export function HapticLink({ className, onTouchStart, ...props }: LinkProps) {
  const { lightTap } = useHapticFeedback();

  const handleTouchStart = (e: React.TouchEvent<HTMLAnchorElement>) => {
    lightTap();
    onTouchStart?.(e);
  };

  return (
    <Link
      className={className}
      onTouchStart={handleTouchStart}
      {...props}
    />
  );
}

export function HapticExternalLink({ className, onTouchStart, ...props }: AnchorProps) {
  const { lightTap } = useHapticFeedback();

  const handleTouchStart = (e: React.TouchEvent<HTMLAnchorElement>) => {
    lightTap();
    onTouchStart?.(e);
  };

  return (
    <a
      className={className}
      onTouchStart={handleTouchStart}
      {...props}
    />
  );
}

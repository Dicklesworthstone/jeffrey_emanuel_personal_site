"use client";

import Link from "next/link";
import { useRef, useCallback } from "react";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import type { ComponentProps } from "react";

const TAP_MOVE_THRESHOLD_PX = 8;

type LinkProps = ComponentProps<typeof Link>;
type AnchorProps = ComponentProps<"a">;

export function HapticLink({
  className,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ...props
}: LinkProps) {
  const { lightTap } = useHapticFeedback();
  const tapStartRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    tapStartRef.current = e.pointerType === "touch" ? { x: e.clientX, y: e.clientY } : null;
    onPointerDown?.(e);
  }, [onPointerDown]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    const start = tapStartRef.current;
    tapStartRef.current = null;
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < TAP_MOVE_THRESHOLD_PX) {
      lightTap();
    }
    onPointerUp?.(e);
  }, [lightTap, onPointerUp]);

  const handlePointerCancel = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    tapStartRef.current = null;
    onPointerCancel?.(e);
  }, [onPointerCancel]);

  return (
    <Link
      className={className}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      {...props}
    />
  );
}

export function HapticExternalLink({
  className,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ...props
}: AnchorProps) {
  const { lightTap } = useHapticFeedback();
  const tapStartRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    tapStartRef.current = e.pointerType === "touch" ? { x: e.clientX, y: e.clientY } : null;
    onPointerDown?.(e);
  }, [onPointerDown]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    const start = tapStartRef.current;
    tapStartRef.current = null;
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < TAP_MOVE_THRESHOLD_PX) {
      lightTap();
    }
    onPointerUp?.(e);
  }, [lightTap, onPointerUp]);

  const handlePointerCancel = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    tapStartRef.current = null;
    onPointerCancel?.(e);
  }, [onPointerCancel]);

  return (
    <a
      className={className}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      {...props}
    />
  );
}

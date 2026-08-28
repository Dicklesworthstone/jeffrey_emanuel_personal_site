"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  isVisible?: boolean;
  decimals?: number;
  className?: string;
}

function formatValue(n: number, target: number, decimals?: number): string {
  if (typeof decimals === "number") return n.toFixed(decimals);
  // Auto-detect: if target is integer, show integer. Else show 1 decimal.
  return target % 1 === 0 ? Math.round(n).toString() : n.toFixed(1);
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 2000,
  isVisible = true,
  decimals,
  className,
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  // Initialise at the true value so server markup, crawlers and the
  // pre-scroll paint all show the real number. The count-up only begins once
  // the parent reports visibility, and its first frame (easeOutExpo(0) === 0)
  // is what resets the display to 0.
  const [count, setCount] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Reduced motion: never count up; mark as settled after hydration
  useEffect(() => {
    if (prefersReducedMotion && !hasAnimated) {
      const hydrationId = setTimeout(() => setHasAnimated(true), 0);
      return () => clearTimeout(hydrationId);
    }
    return undefined;
  }, [prefersReducedMotion, hasAnimated]);

  const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  useEffect(() => {
    if (prefersReducedMotion || !isVisible || hasAnimated) return;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - (startTimeRef.current ?? timestamp);
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentCount = easedProgress * value;

      setCount(currentCount);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(value);
        setHasAnimated(true);
      }
    };

    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isVisible, hasAnimated, value, duration, prefersReducedMotion]);

  // Show the exact target once finished (or when motion is reduced); before
  // the count-up starts, `count` already equals the target.
  const settled = hasAnimated || Boolean(prefersReducedMotion);
  const displayNumber = formatValue(settled ? value : count, value, decimals);

  // Final value for screen readers
  const srValue = formatValue(value, value, decimals);

  return (
    <span className={className}>
      <span className="sr-only">{prefix}{srValue}{suffix}</span>
      <span className="tabular-nums" aria-hidden="true">
        {prefix}{displayNumber}{suffix}
      </span>
    </span>
  );
}

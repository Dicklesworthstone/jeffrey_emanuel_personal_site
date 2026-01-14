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
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Handle reduced motion preference after hydration
  useEffect(() => {
    if (prefersReducedMotion && !hasAnimated) {
      const hydrationId = setTimeout(() => {
        setCount(value);
        setHasAnimated(true);
      }, 0);
      return () => clearTimeout(hydrationId);
    }
    return undefined;
  }, [prefersReducedMotion, value, hasAnimated]);

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

  // Determine display value
  let displayNumber: string;
  
  if (typeof decimals === "number") {
    displayNumber = count.toFixed(decimals);
  } else {
    // Auto-detect: if target is integer, show integer. Else show 1 decimal.
    displayNumber = value % 1 === 0 
      ? Math.round(count).toString() 
      : count.toFixed(1);
  }

  // Ensure we show the final target correctly when finished or reduced motion
  if (hasAnimated || prefersReducedMotion) {
    if (typeof decimals === "number") {
      displayNumber = value.toFixed(decimals);
    } else {
      displayNumber = value % 1 === 0 ? value.toString() : value.toFixed(1);
    }
  }

  // Final value for screen readers
  const srValue = typeof decimals === "number" 
    ? value.toFixed(decimals) 
    : (value % 1 === 0 ? value.toString() : value.toFixed(1));

  return (
    <span className={className}>
      <span className="sr-only">{prefix}{srValue}{suffix}</span>
      <span className="tabular-nums" aria-hidden="true">
        {prefix}{displayNumber}{suffix}
      </span>
    </span>
  );
}

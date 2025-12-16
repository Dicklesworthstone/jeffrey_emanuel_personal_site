"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  /** Array of words/phrases to cycle through */
  words: string[];
  /** Time in ms to display each word before switching */
  displayDuration?: number;
  /** Typing speed in ms per character */
  typingSpeed?: number;
  /** Deleting speed in ms per character */
  deletingSpeed?: number;
  /** Pause duration after typing completes */
  pauseAfterTyping?: number;
  /** CSS class for the text */
  className?: string;
  /** Whether to show the cursor */
  showCursor?: boolean;
  /** Whether to loop the animation */
  loop?: boolean;
}

/**
 * Typewriter animation component that cycles through words/phrases.
 * Respects reduced motion preferences.
 */
export default function TypingAnimation({
  words,
  displayDuration = 2000,
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseAfterTyping = 1500,
  className,
  showCursor = true,
  loop = true,
}: TypingAnimationProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const currentWord = words[currentWordIndex];

  // If reduced motion, just show the first word without animation
  const handleTyping = useCallback(() => {
    if (prefersReducedMotion) {
      setCurrentText(words[0]);
      return;
    }

    if (!isDeleting) {
      // Typing
      if (currentText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, pause then start deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseAfterTyping);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next word
        setIsDeleting(false);
        if (loop || currentWordIndex < words.length - 1) {
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }
  }, [
    currentText,
    currentWord,
    isDeleting,
    words,
    currentWordIndex,
    loop,
    typingSpeed,
    deletingSpeed,
    pauseAfterTyping,
    prefersReducedMotion,
  ]);

  useEffect(() => {
    const cleanup = handleTyping();
    return cleanup;
  }, [handleTyping]);

  // For reduced motion, just show the first word
  if (prefersReducedMotion) {
    return <span className={className}>{words[0]}</span>;
  }

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span>{currentText}</span>
      {showCursor && (
        <motion.span
          className="ml-0.5 inline-block h-[1em] w-[3px] bg-current"
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
      )}
      {/* Screen reader text */}
      <span className="sr-only">{currentWord}</span>
    </span>
  );
}

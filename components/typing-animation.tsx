"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  /** Array of words/phrases to cycle through */
  words: string[];
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
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseAfterTyping = 1500,
  className,
  showCursor = true,
  loop = true,
}: TypingAnimationProps) {
  if (words.length === 0) {
    return null;
  }

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const currentWord = words[currentWordIndex];

  useEffect(() => {
    // If reduced motion, we don't need to run the animation logic at all
    if (prefersReducedMotion) return;

    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (currentText.length > 0) {
        // Deleting
        timeout = setTimeout(() => {
          setCurrentText((prev) => prev.slice(0, -1));
        }, deletingSpeed);
      } else {
        // Finished deleting, move to next word
        timeout = setTimeout(() => {
          setIsDeleting(false);
          if (loop || currentWordIndex < words.length - 1) {
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
          }
        }, deletingSpeed);
      }
    } else {
      if (currentText.length < currentWord.length) {
        // Typing
        timeout = setTimeout(() => {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        // If we're at the last word and not looping, stop here.
        if (!loop && currentWordIndex === words.length - 1) {
          return;
        }
        // Finished typing, pause then start deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseAfterTyping);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    currentText,
    currentWord,
    isDeleting,
    currentWordIndex,
    words.length,
    loop,
    typingSpeed,
    deletingSpeed,
    pauseAfterTyping,
    prefersReducedMotion,
  ]);

  // For reduced motion, just show the first word (or current word if logic allows)
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

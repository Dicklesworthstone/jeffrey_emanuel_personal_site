"use client";

import { useEffect, useCallback, useRef } from "react";

// The famous Konami Code sequence
const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

/**
 * Hook to detect the Konami Code (↑↑↓↓←→←→BA).
 * Calls the callback when the code is entered correctly.
 */
export function useKonamiCode(callback: () => void): void {
  const inputRef = useRef<string[]>([]);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Add the key to our input array
    inputRef.current.push(event.code);

    // Keep only the last N keys (where N is the length of the Konami code)
    if (inputRef.current.length > KONAMI_CODE.length) {
      inputRef.current.shift();
    }

    // Check if the input matches the Konami code
    if (
      inputRef.current.length === KONAMI_CODE.length &&
      inputRef.current.every((key, index) => key === KONAMI_CODE[index])
    ) {
      // Invoke callback with null safety check
      callbackRef.current?.();
      // Reset the input
      inputRef.current = [];
    }
  }, []);

  useEffect(() => {
    // SSR safety check
    if (typeof window === "undefined") return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export default useKonamiCode;

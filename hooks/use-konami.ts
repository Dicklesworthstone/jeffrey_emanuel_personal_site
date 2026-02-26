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
  "b",
  "a",
] as const;

type KonamiKey = (typeof KONAMI_CODE)[number];

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return true;
  }

  if (target instanceof HTMLElement && target.isContentEditable) {
    return true;
  }

  return target.closest("[contenteditable]:not([contenteditable='false'])") !== null;
}

function normalizeKonamiKey(key: string): KonamiKey | null {
  const normalized = key.length === 1 ? key.toLowerCase() : key;

  if (
    normalized === "ArrowUp" ||
    normalized === "ArrowDown" ||
    normalized === "ArrowLeft" ||
    normalized === "ArrowRight" ||
    normalized === "a" ||
    normalized === "b"
  ) {
    return normalized as KonamiKey;
  }

  return null;
}

/**
 * Hook to detect the Konami Code (↑↑↓↓←→←→BA).
 * Calls the callback when the code is entered correctly.
 */
export function useKonamiCode(callback: () => void): void {
  const sequenceIndexRef = useRef(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore typing contexts and key combos so normal text input is never affected.
    if (
      event.isComposing ||
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey ||
      isEditableTarget(event.target)
    ) {
      return;
    }

    const key = normalizeKonamiKey(event.key);
    if (!key) {
      sequenceIndexRef.current = 0;
      return;
    }

    if (key === KONAMI_CODE[sequenceIndexRef.current]) {
      sequenceIndexRef.current += 1;

      if (sequenceIndexRef.current === KONAMI_CODE.length) {
        callbackRef.current();
        sequenceIndexRef.current = 0;
      }
      return;
    }

    sequenceIndexRef.current = key === KONAMI_CODE[0] ? 1 : 0;
  }, []);

  useEffect(() => {
    // SSR safety check
    if (typeof window === "undefined") return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export default useKonamiCode;

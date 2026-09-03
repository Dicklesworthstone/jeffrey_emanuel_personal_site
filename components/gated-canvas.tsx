"use client";

import { useRef, useSyncExternalStore } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useInView, useReducedMotion } from "framer-motion";
import { cn, supportsWebGL } from "@/lib/utils";

const emptySubscribe = () => () => {};
const getWebGLClientSnapshot = () => supportsWebGL();
const getWebGLServerSnapshot = () => true;

type GatedCanvasProps = CanvasProps & {
  /** Class for the wrapper div that carries the visibility sentinel */
  wrapperClassName?: string;
};

/**
 * R3F <Canvas> whose render loop only runs while it is near the viewport.
 * Article pages mount several WebGL canvases at once; without this gate each
 * one runs its useFrame work at 60fps for the whole page lifetime, including
 * while scrolled far offscreen.
 */
export default function GatedCanvas({
  children,
  wrapperClassName,
  frameloop,
  ...props
}: GatedCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(wrapperRef, { margin: "200px" });
  // Under prefers-reduced-motion the scene still renders (so user-driven state
  // changes show), but only on demand — no continuous time-based motion.
  const prefersReducedMotion = useReducedMotion();
  const hasWebGL = useSyncExternalStore(emptySubscribe, getWebGLClientSnapshot, getWebGLServerSnapshot);

  // Without WebGL, mounting a Canvas throws an uncatchable async
  // context-creation error — render an empty placeholder instead.
  if (!hasWebGL) {
    return <div className={cn("h-full w-full", wrapperClassName)} aria-hidden="true" />;
  }

  const activeLoop = prefersReducedMotion ? "demand" : (frameloop ?? "always");

  return (
    <div ref={wrapperRef} className={cn("h-full w-full", wrapperClassName)}>
      <Canvas {...props} frameloop={isInView ? activeLoop : "never"}>
        {children}
      </Canvas>
    </div>
  );
}

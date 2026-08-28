"use client";

import { useRef } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useInView } from "framer-motion";
import { cn, supportsWebGL } from "@/lib/utils";

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

  // Without WebGL, mounting a Canvas throws an uncatchable async
  // context-creation error — render an empty placeholder instead.
  if (typeof window !== "undefined" && !supportsWebGL()) {
    return <div className={cn("h-full w-full", wrapperClassName)} aria-hidden="true" />;
  }

  return (
    <div ref={wrapperRef} className={cn("h-full w-full", wrapperClassName)}>
      <Canvas {...props} frameloop={isInView ? (frameloop ?? "always") : "never"}>
        {children}
      </Canvas>
    </div>
  );
}

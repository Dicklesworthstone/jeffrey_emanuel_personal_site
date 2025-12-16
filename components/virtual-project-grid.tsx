"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import ProjectCard from "@/components/project-card";
import SkeletonCard from "@/components/skeleton-card";
import type { Project } from "@/lib/content";

interface VirtualProjectGridProps {
  projects: Project[];
  className?: string;
}

/**
 * Virtual scrolling grid for projects
 * Only renders visible items for better performance with many projects
 */
export default function VirtualProjectGrid({
  projects,
  className = "",
}: VirtualProjectGridProps) {
  // Determine grid columns based on screen size
  const getColumnsPerRow = () => {
    if (typeof window === "undefined") return 3;
    const width = window.innerWidth;
    if (width < 768) return 1; // Mobile: 1 column
    if (width < 1024) return 2; // Tablet: 2 columns
    return 3; // Desktop: 3 columns
  };

  // Start with a default to match SSR (desktop layout is the "default" structure)
  const [columnsPerRow, setColumnsPerRow] = useState(3);
  const [isMounted, setIsMounted] = useState(false);

  // Initial load: show a reasonable batch (e.g. 3 rows of 3) so content is present for SEO/SSR
  // but won't cause hydration mismatch if the user is actually on mobile.
  const BUFFER_ROWS = 2;
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: 9 + (BUFFER_ROWS * 3), // 9 initial + buffer
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 1. Handle initial client-side sizing (fixes hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
    const correctColumns = getColumnsPerRow();
    setColumnsPerRow(correctColumns);
    
    // Adjust initial range based on actual screen size once mounted
    const initialCount = correctColumns * (3 + BUFFER_ROWS * 2);
    setVisibleRange(prev => ({
      ...prev,
      end: Math.min(initialCount, projects.length)
    }));

    const handleResize = () => setColumnsPerRow(getColumnsPerRow());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [projects.length]);


  // 2. Handle infinite scroll logic
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !isMounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleRange((prev) => {
              const newEnd = Math.min(prev.end + columnsPerRow * 2, projects.length);
              return { ...prev, end: newEnd };
            });
          }
        });
      },
      { rootMargin: "400px" } // Start loading when 400px away from bottom
    );

    observer.observe(sentinel);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [columnsPerRow, projects.length, isMounted]);

  const visibleProjects = useMemo(
    () => projects.slice(visibleRange.start, visibleRange.end),
    [projects, visibleRange]
  );

  const isLoading = visibleRange.end < projects.length;

  return (
    <div ref={containerRef} className={className}>
      {visibleProjects.map((project) => (
        <ProjectCard key={project.name} project={project} />
      ))}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: "1px" }} />

      {/* Show loading skeletons while more items load */}
      {isLoading && (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}
    </div>
  );
}

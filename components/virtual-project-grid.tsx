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

  const [columnsPerRow, setColumnsPerRow] = useState(getColumnsPerRow);

  // Calculate initial items to show
  const BUFFER_ROWS = 2;
  const initialItemCount = columnsPerRow * (3 + BUFFER_ROWS * 2);

  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: Math.min(initialItemCount, projects.length),
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleResize = () => setColumnsPerRow(getColumnsPerRow());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use Intersection Observer to detect when to load more
    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    sentinel.setAttribute("data-sentinel", "true");
    container.appendChild(sentinel);

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
      // Safely remove sentinel even if container changed
      if (sentinel.parentNode) {
        sentinel.parentNode.removeChild(sentinel);
      }
    };
  }, [columnsPerRow, projects.length]);

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

"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  Home,
  User,
  Briefcase,
  FolderGit2,
  PenSquare,
  Video,
  Mail,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  ArrowRight,
  FileText,
} from "lucide-react";
import Fuse from "fuse.js";
import { navItems, projects, writingHighlights, siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

type CommandCategory = "pages" | "projects" | "writing" | "social" | "actions" | "search_results";

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  category: CommandCategory;
  action: () => void;
  keywords?: string[];
}

interface SearchIndexItem {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  content: string;
}

const pageIcons: Record<string, React.ReactNode> = {
  "/": <Home className="h-4 w-4" />,
  "/about": <User className="h-4 w-4" />,
  "/consulting": <Briefcase className="h-4 w-4" />,
  "/projects": <FolderGit2 className="h-4 w-4" />,
  "/writing": <PenSquare className="h-4 w-4" />,
  "/media": <Video className="h-4 w-4" />,
  "/contact": <Mail className="h-4 w-4" />,
};

const categoryLabels: Record<CommandCategory, string> = {
  pages: "Pages",
  projects: "Projects",
  writing: "Writing",
  social: "Social",
  actions: "Actions",
  search_results: "Content Search",
};

/**
 * Command palette for quick navigation and search.
 * Supports fuzzy search across pages, projects, writing, and actions.
 */
export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchIndexItem> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fetch search index on load (or on first open)
  useEffect(() => {
    if (isOpen && searchIndex.length === 0 && !isLoading && !hasError) {
      setIsLoading(true);
      fetch("/api/search")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch search index");
          return res.json();
        })
        .then((data) => {
          setSearchIndex(data);
          const fuseInstance = new Fuse<SearchIndexItem>(data, {
            keys: [
              { name: "title", weight: 0.7 },
              { name: "tags", weight: 0.5 },
              { name: "category", weight: 0.4 },
              { name: "excerpt", weight: 0.3 },
              { name: "content", weight: 0.1 },
            ],
            threshold: 0.4,
            includeScore: true,
          });
          setFuse(fuseInstance);
        })
        .catch((err) => {
          console.error("Failed to load search index", err);
          setHasError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, searchIndex.length, isLoading, hasError]);

  // Build static commands list
  const staticCommands = useMemo<Command[]>(() => {
    const cmds: Command[] = [];

    // Navigation pages
    navItems.forEach((item) => {
      cmds.push({
        id: `page-${item.href}`,
        title: item.label,
        subtitle: `Go to ${item.label}`,
        icon: pageIcons[item.href] || <ArrowRight className="h-4 w-4" />,
        category: "pages",
        action: () => {
          router.push(item.href);
          onClose();
        },
        keywords: [item.label.toLowerCase()],
      });
    });

    // Projects (top 15)
    projects.slice(0, 15).forEach((project) => {
      cmds.push({
        id: `project-${project.name}`,
        title: project.name,
        subtitle: project.short,
        icon: <FolderGit2 className="h-4 w-4" />,
        category: "projects",
        action: () => {
          if (project.href.startsWith("http")) {
            window.open(project.href, "_blank");
          } else {
            router.push(project.href);
          }
          onClose();
        },
        keywords: [
          project.name.toLowerCase(),
          ...project.tags.map((t) => t.toLowerCase()),
        ],
      });
    });

    // Featured Writing (Keep these as they are high priority)
    writingHighlights.forEach((item) => {
      cmds.push({
        id: `writing-${item.title}`,
        title: item.title,
        subtitle: item.category,
        icon: <PenSquare className="h-4 w-4" />,
        category: "writing",
        action: () => {
          if (item.href.startsWith("http")) {
            window.open(item.href, "_blank");
          } else {
            router.push(item.href);
          }
          onClose();
        },
        keywords: [item.title.toLowerCase(), item.category.toLowerCase()],
      });
    });

    // Social links
    cmds.push({
      id: "social-github",
      title: "GitHub",
      subtitle: "View GitHub profile",
      icon: <Github className="h-4 w-4" />,
      category: "social",
      action: () => {
        window.open(siteConfig.social.github, "_blank");
        onClose();
      },
      keywords: ["github", "code", "repos"],
    });
    cmds.push({
      id: "social-twitter",
      title: "X (Twitter)",
      subtitle: "Follow on X",
      icon: <Twitter className="h-4 w-4" />,
      category: "social",
      action: () => {
        window.open(siteConfig.social.x, "_blank");
        onClose();
      },
      keywords: ["twitter", "x", "social"],
    });
    cmds.push({
      id: "social-linkedin",
      title: "LinkedIn",
      subtitle: "Connect on LinkedIn",
      icon: <Linkedin className="h-4 w-4" />,
      category: "social",
      action: () => {
        window.open(siteConfig.social.linkedin, "_blank");
        onClose();
      },
      keywords: ["linkedin", "professional", "connect"],
    });

    return cmds;
  }, [router, onClose]);

  // Combined results (Static + Fuse)
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return staticCommands;

    const lowerQuery = query.toLowerCase();
    
    // 1. Filter static commands
    const staticMatches = staticCommands.filter((cmd) => {
      const titleMatch = cmd.title.toLowerCase().includes(lowerQuery);
      const subtitleMatch = cmd.subtitle?.toLowerCase().includes(lowerQuery);
      const keywordMatch = cmd.keywords?.some((k) => k.includes(lowerQuery));
      return titleMatch || subtitleMatch || keywordMatch;
    });

    // 2. Search dynamic index with Fuse
    const fuseMatches: Command[] = [];
    if (fuse) {
      const results = fuse.search(query, { limit: 5 });
      results.forEach((result) => {
        // Avoid duplicates if they are already in static list (by title)
        const isDuplicate = staticMatches.some(c => c.title === result.item.title);
        if (!isDuplicate) {
          fuseMatches.push({
            id: `search-result-${result.item.slug}`,
            title: result.item.title,
            subtitle: result.item.excerpt.slice(0, 60) + "...",
            icon: <FileText className="h-4 w-4" />,
            category: "search_results",
            action: () => {
              router.push(`/writing/${result.item.slug}`);
              onClose();
            },
          });
        }
      });
    }

    return [...staticMatches, ...fuseMatches];
  }, [staticCommands, query, fuse, router, onClose]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Partial<Record<CommandCategory, Command[]>> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category]!.push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      const timeoutId = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timeoutId);
    }
    return;
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) =>
            i < filteredCommands.length - 1 ? i + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) =>
            i > 0 ? i - 1 : Math.max(0, filteredCommands.length - 1)
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredCommands, selectedIndex, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    selectedEl?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  let globalIndex = 0;
  const activeId = filteredCommands[selectedIndex]?.id;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Palette */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -20 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[15%] z-[101] mx-auto max-w-xl sm:inset-x-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages, projects, writing..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none"
                  aria-label="Search commands"
                  aria-activedescendant={activeId}
                  aria-controls="command-results"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                <kbd className="hidden rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300 sm:inline-block">
                  ESC
                </kbd>
              </div>

              {/* Screen reader status announcements */}
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              >
                {isLoading
                  ? "Loading search index..."
                  : query.trim()
                  ? filteredCommands.length === 0
                    ? `No results found for "${query}"`
                    : `${filteredCommands.length} results found`
                  : ""}
              </div>

              {/* Results */}
              <div
                ref={listRef}
                id="command-results"
                className="max-h-[60vh] overflow-y-auto p-2"
                role="listbox"
              >
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500" aria-hidden="true">
                    No results found for &quot;{query}&quot;
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, cmds]) => (
                    <div
                      key={category}
                      className="mb-2"
                      role="group"
                      aria-label={categoryLabels[category as CommandCategory]}
                    >
                      <div className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-500" aria-hidden="true">
                        {categoryLabels[category as CommandCategory]}
                      </div>
                      {cmds?.map((cmd) => {
                        const index = globalIndex++;
                        const isSelected = index === selectedIndex;
                        return (
                          <button
                            key={cmd.id}
                            id={cmd.id}
                            data-index={index}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                              isSelected
                                ? "bg-violet-500/20 text-white"
                                : "text-slate-300 hover:bg-white/5"
                            )}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <span
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg",
                                isSelected
                                  ? "bg-violet-500 text-white"
                                  : "bg-slate-800 text-slate-400"
                              )}
                            >
                              {cmd.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-medium">
                                {cmd.title}
                              </div>
                              {cmd.subtitle && (
                                <div className="truncate text-xs text-slate-500">
                                  {cmd.subtitle}
                                </div>
                              )}
                            </div>
                            {cmd.category === "social" ? (
                              <ExternalLink className="h-4 w-4 text-slate-500" />
                            ) : (
                              <ArrowRight
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isSelected
                                    ? "translate-x-1 text-violet-400"
                                    : "text-slate-500"
                                )}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-slate-300">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-slate-300">
                      ↵
                    </kbd>
                    <span>Select</span>
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-slate-300">
                    ?
                  </kbd>
                  <span>All shortcuts</span>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

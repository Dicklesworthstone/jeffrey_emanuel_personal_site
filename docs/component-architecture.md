# Component Architecture

## Overview

This document maps the component structure, client/server boundaries, and shared patterns for the Jeffrey Emanuel personal site.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Framer Motion for animations
- Three.js for 3D visualizations

## Client vs Server Components

### Client Components ("use client")
Interactive components that need browser APIs or user interaction:

| Component | Purpose |
|-----------|---------|
| `hero.tsx` | Animated hero section with 3D scene |
| `site-header.tsx` | Navigation with mobile menu |
| `section-shell.tsx` | Wrapper with scroll-triggered animation |
| `flywheel-visualization.tsx` | Interactive 3D flywheel |
| `three-scene.tsx` | Three.js canvas wrapper |
| `project-card.tsx` | Interactive project cards |
| `writing-card.tsx` | Article cards with hover states |
| `bottom-sheet.tsx` | Mobile navigation drawer |
| `scroll-to-top.tsx` | Scroll-to-top button |
| `glow-orbits.tsx` | Animated background glows |
| All page.tsx files | Need client for animations |

### Server Components
Static or data-fetching components:

| Component | Purpose |
|-----------|---------|
| `stats-grid.tsx` | Static stats display |
| `site-footer.tsx` | Static footer |
| `skeleton-*.tsx` | Loading skeletons |
| `markdown-renderer.tsx` | MDX rendering |

## Animation Patterns

### Framer Motion Usage
Primary animation library. Common patterns:

```tsx
// Standard fade-up animation
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
>
```

### Easing Curves
- Hero elements: `[0.16, 1, 0.3, 1]` - snappy entrance
- Sections: `[0.21, 0.47, 0.32, 0.98]` - smooth ease-out

### Scroll-triggered Animations
Using `useIntersectionObserver` hook with Framer Motion:
```tsx
const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
// Then animate based on isIntersecting
```

## Custom Hooks

### `useIntersectionObserver`
- Location: `hooks/use-intersection-observer.ts`
- Purpose: Detect element visibility for scroll animations
- Key feature: Starts with `isIntersecting=true` to prevent SSR flash

### `useMobileOptimizations`
- Location: `hooks/use-mobile-optimizations.ts`
- Purpose: iOS-specific fixes (double-tap zoom, orientation)

### `useHapticFeedback`
- Location: `hooks/use-haptic-feedback.ts`
- Purpose: Vibration API for mobile interactions

## CSS Architecture

### Tailwind Configuration
- Uses `cn()` utility for class merging (clsx + tailwind-merge)
- Custom utilities in globals.css

### Custom Classes
- `text-balance-pro` - Text balancing
- `text-pretty-pro` - Text prettying
- `glass-card` - Glassmorphism effect
- `glow-ring` - Animated glow effects

### Color Palette
- Primary: sky-400/500 (#38bdf8)
- Accent: violet-400/500 (#a78bfa)
- Secondary: emerald-400 (#34d399)
- Background: slate-950 (#020617)

## Design Tokens

### Spacing
- Section padding: py-24 md:py-32 lg:py-40
- Content max-width: max-w-7xl
- Component gaps: gap-4 to gap-8

### Typography
- Headings: font-bold, tracking-tight/-tighter
- Body: font-medium, text-slate-400

## Shared Utilities

### `lib/utils.ts`
```ts
cn(...inputs: ClassValue[]) // Class name merger
```

### `lib/content.ts`
- Site configuration
- Project data
- Stats data
- Content strings

## Code Splitting

### Dynamic Imports
Three.js is dynamically imported to avoid blocking initial load:
```tsx
const ThreeScene = dynamic(() => import("@/components/three-scene"), {
  ssr: false,
  loading: () => <ThreeSceneLoading />,
});
```

## Extension Points

For new features, follow these patterns:

1. **New animations**: Use Framer Motion with existing easing curves
2. **New hooks**: Place in `hooks/` with "use client" directive
3. **New sections**: Use SectionShell wrapper for consistency
4. **New interactive components**: Mark as client components

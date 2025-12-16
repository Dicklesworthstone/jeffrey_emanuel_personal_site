# Core Web Vitals Optimizations

## Date: 2025-12-15

## Baseline Metrics (from Lighthouse)

| Page | Performance | LCP | TBT | CLS |
|------|-------------|-----|-----|-----|
| Home | 71 | 6627ms | 238ms | 0.01 |
| Projects | 91 | 3506ms | 38ms | 0.00 |

## Optimizations Applied

### 1. Preconnect Hints (layout.tsx)
```tsx
<link rel="preconnect" href="https://www.googletagmanager.com" />
<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
```

### 2. Font Optimization (Already Implemented)
- Using `next/font` for automatic font optimization
- Fonts are self-hosted (no external requests)
- `font-display: swap` enabled by default

### 3. Image Optimization (Already Implemented)
- Using Next.js Image component with `priority` for LCP image
- WebP format for all images
- Responsive `sizes` prop configured

### 4. JavaScript Optimization (Already Implemented)
- Three.js dynamically imported only on desktop
- CSS/SVG fallback on mobile (ThreeSceneFallback)
- Route-based code splitting via Next.js

### 5. CSS Optimization (Already Implemented)
- Critical CSS automatically inlined by Next.js
- Tailwind CSS with purging enabled
- Reduced motion media queries for accessibility

### 6. Skip Link for Accessibility
- Added skip link for keyboard navigation
- Improves accessibility and reduces interaction time

## Remaining Opportunities

1. **LCP Improvement**: The 6627ms LCP on home is primarily due to Three.js rendering. The mobile fallback addresses this for smaller screens.

2. **Server-side Rendering**: All pages are statically generated at build time, which is optimal.

3. **CDN**: Deploying to a CDN like Vercel will significantly improve TTFB and LCP.

## Expected Impact

After deployment to a production CDN:
- LCP: Expected improvement to <2500ms on most connections
- TBT: Should remain under 200ms
- CLS: Should remain near 0

## Verification Steps

To verify improvements:
1. Deploy to production
2. Run Lighthouse in incognito mode
3. Test on WebPageTest.org for geographic distribution
4. Monitor with Google Search Console Core Web Vitals report

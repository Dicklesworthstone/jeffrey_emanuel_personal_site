# Changelog

All notable changes to the Jeffrey Emanuel personal site are documented here.

- **Repository**: [Dicklesworthstone/jeffrey_emanuel_personal_site](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site)
- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, React Three Fiber, GSAP, Framer Motion, Bun
- **Deployment**: Vercel
- **Tracking granularity**: This changelog groups commits by logical era rather than individual commit. Automated beads-sync and stargazer-intelligence commits are omitted for clarity.

> Links use the format `GitHash` &rarr; `https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/<full-hash>`.

---

## [Unreleased] &mdash; Post-v0.2.0 Development

**Period**: 2025-12-15 &rarr; 2026-03-21 (HEAD at [`81ffd88`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/81ffd8852d13b985bed25f44240628e2e067df0f))

This era encompasses the majority of the site's development: five interactive technical articles, the TL;DR flywheel showcase page, a comprehensive testing infrastructure, major UI/UX overhauls, and significant hardening across security, accessibility, and performance.

### Interactive Technical Articles (Writing System)

A full interactive-article platform was built, supporting scoped CSS, math tooltips, jargon dictionaries, 3D visualizations (React Three Fiber + postprocessing), and per-article OpenGraph images.

| Article | First commit | Key hash |
|---------|-------------|----------|
| **RaptorQ Erasure Coding** | 2026-02-10 | [`38a2a9f`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/38a2a9f) |
| **Overprompting in LLMs** | 2026-02-12 | [`2bf9eed`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/2bf9eed) |
| **Hoeffding's D Statistic** | 2026-02-12 | [`7280f9c`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/7280f9c) |
| **CMA-ES Optimization** | 2026-02-12 | [`b9deaed`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/b9deaed) |
| **Barra Factor Model** | 2026-02-12 | [`dac6afa`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/dac6afa) |
| **Lamport's Bakery Algorithm** | 2026-02-12 | [`00a1a05`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/00a1a05) |

- Shared tooltip infrastructure with extended variant support and jargon dictionaries ([`f61492d`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f61492d))
- Responsive typography via CSS `clamp()` for mobile readability ([`00ab779`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/00ab779))
- Cross-browser scroll metrics and IntersectionObserver fallback ([`6a4d931`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/6a4d931))
- Interactive article CSS scope validation guard ([`ca6ae56`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/ca6ae56))
- Added `@react-three/postprocessing` for 3D visual effects ([`aec3da7`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/aec3da7))
- Added `d3` v7.9.0 for RaptorQ article visualizations ([`2cfb28d`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/2cfb28d))

### TL;DR Flywheel Showcase Page (`/tldr`)

A dedicated page showcasing the Agentic Coding Tooling Flywheel with rich interactivity.

- Initial `/tldr` page with tool grid and synergy diagram ([`2eedcce`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/2eedcce))
- Fuzzy search and filtering for tool grid ([`b7b3c84`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/b7b3c84))
- Star count formatting utility with K/M abbreviation ([`b129a6b`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/b129a6b))
- Live GitHub star count fetching for tool cards ([`b260950`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/b260950))
- 3D perspective tilt effect on hover ([`ce3346d`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/ce3346d))
- Tool comparison mode with vim-style keyboard navigation ([`91b4a1d`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/91b4a1d))
- Comprehensive mobile-first UI polish, section nav, and accessibility ([`52ee07f`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/52ee07f))
- DCG, RU, ACFS promoted to core tools ([`e1beb97`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/e1beb97))
- Robust touch/pointer handling and expanded E2E coverage ([`f7b5b20`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f7b5b20))
- Multiple concurrent card highlights in synergy diagram ([`403effb`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/403effb))

### Nvidia Story Page

- Design specification and narrative components ([`836c7c0`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/836c7c0))
- Animated market cap drop visualization ([`f562e1a`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f562e1a))
- Timeline with scroll animations ([`dd4697f`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/dd4697f))
- Quote wall, podcast section, full page route at `/nvidia-story` ([`2bc2212`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/2bc2212))

### Endorsements, Demos, and Social Proof

- Reusable endorsement card and showcase component ([`86c8265`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/86c8265), [`2caf299`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/2caf299))
- Naval Ravikant's real endorsement replacing fake testimonials ([`d420e37`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/d420e37))
- DemoCard and DemoShowcase for live "Try It" section ([`32dd12d`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/32dd12d), [`e7bc607`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/e7bc607))
- Expandable X stats card with 2025 engagement highlights ([`526d723`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/526d723))
- Featured sites section on landing page ([`6f55ea0`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/6f55ea0))

### Stargazer Intelligence System

- Stargazer analysis script and types ([`6014ca8`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/6014ca8), [`5ec22c4`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/5ec22c4))
- Notable Stargazers on homepage and project detail pages ([`8941470`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/8941470), [`cf903f6`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/cf903f6))
- Strict "legends only" threshold for display ([`68fb7c0`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/68fb7c0))
- GitHub Action for weekly stargazer updates ([`88f2cc3`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/88f2cc3))

### UI/UX Overhaul (Feb 2026)

- Scroll progress bar, noise overlay, and spring-driven header ([`44fa359`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/44fa359))
- Magnetic interactions and parallax orbits ([`fa3a2d2`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/fa3a2d2))
- Consulting page redesign with animated grid and motion ([`f1cb2ea`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f1cb2ea))
- Hero card upgrades, flywheel visualization, TL;DR synergy diagram improvements ([`31dc382`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/31dc382))
- Comprehensive mobile-first polish and interaction refinements ([`9134030`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/9134030))
- Design system with fluid typography, spacing, and animation tokens ([`adf5013`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/adf5013))

### 3D / Three.js Enhancements

- 3D animated header icon with 24 hourly mathematical animations ([`e3c09ef`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/e3c09ef), [`3cccc9c`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/3cccc9c))
- Mathematical halo overlay and time-slot palette system ([`e281db3`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/e281db3))
- Three.js scene enabled on all devices with adaptive quality ([`f22c58b`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f22c58b))
- Mobile quality tuning for smoother 60fps target ([`bd36502`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/bd36502))
- 3D constraint visualization with enhanced shader system for Overprompting article ([`9bc8fdc`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/9bc8fdc))

### SEO and Social Sharing

- OpenGraph/Twitter card metadata and security headers ([`5bd11ac`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/5bd11ac))
- Twitter image generators for all pages ([`aa89f58`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/aa89f58))
- Dynamic OG images for social sharing ([`03d9663`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/03d9663))
- Centralized social image generation ([`041302c`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/041302c))
- GitHub social preview image 1280x640 ([`a26baed`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/a26baed))
- Normalized writing slugs, hardened URL construction, standardized OG image line-height ([`509842c`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/509842c))

### Testing Infrastructure

- Vitest component testing infrastructure ([`cc0521f`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/cc0521f))
- Comprehensive test infrastructure with custom matchers ([`72f9306`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/72f9306))
- Unit tests for formatting, test utils, and content validation ([`b15c262`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/b15c262))
- Playwright E2E tests for `/tldr` and `/projects` pages ([`70f65fa`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/70f65fa))
- TldrToolCard, TldrToolGrid, TldrHero, TldrSynergyDiagram unit tests ([`88b5a4f`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/88b5a4f) &ndash; [`f0e619c`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f0e619c))
- Production Playwright config and diagram probe E2E specs ([`92b4b4e`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/92b4b4e))
- Automated accessibility testing ([`96310e5`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/96310e5))
- TL;DR page component unit tests and E2E suites ([`3f6fa86`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/3f6fa86))

### Security Hardening

- Path traversal, info disclosure, and NaN handling fixes ([`167f900`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/167f900))
- ReDoS vulnerability fix and hook robustness ([`40f3f76`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/40f3f76))
- OG image proxy hardened against open redirect attacks ([`f67dc0c`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f67dc0c))
- XSS hardening across components ([`75e6354`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/75e6354))
- Hydration mismatch and OG image proxy security ([`25371a0`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/25371a0))

### Accessibility

- Explicit `type="button"` on all interactive buttons ([`4458355`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/4458355))
- Comprehensive reduced motion support for all animated components ([`dce896c`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/dce896c))
- Proper heading hierarchy with `headingLevel` prop ([`b8f99e2`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/b8f99e2))
- Screen reader announcements and ARIA structure improvements ([`4186094`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/4186094), [`ece99f8`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/ece99f8))
- Modal focus trap and scroll lock ([`37b8a6a`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/37b8a6a))
- Motion-safe/motion-reduce and aria-hidden attributes ([`a6db79f`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/a6db79f))

### Performance

- Three.js memory leak fixes and layout rect caching ([`f1923af`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f1923af))
- Lazy loading for below-fold homepage sections ([`f848784`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f848784))
- Bundle size reduction via dynamic syntax highlighter loading ([`fefb8de`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/fefb8de))
- React rendering optimization with `useMemo` and `React.memo` ([`1c41ca0`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/1c41ca0))
- Image optimization for massive size reduction ([`8a98289`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/8a98289))
- Removed unused highlight.js and rehype-highlight dependencies ([`708adc2`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/708adc2))
- Eliminated unused CSS and lazy-loaded KaTeX styles ([`d6e9382`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/d6e9382))
- OG image streaming reader pattern to prevent memory exhaustion ([`275d5b1`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/275d5b1))

### Content Updates

- 15 new projects added to showcase ([`e8867d8`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/e8867d8))
- "Rust Port" project category with orange accent theme ([`bb646b0`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/bb646b0))
- Meta Skill added to projects and TLDR flywheel tools ([`19450d9`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/19450d9))
- Chat to File project added ([`15bb9c0`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/15bb9c0))
- Tool descriptions rewritten with authentic voice from tweets ([`be71239`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/be71239))
- Newsletter signup with Buttondown integration (behind feature flag) ([`77bd823`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/77bd823))
- Offline page support ([`041302c`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/041302c))

### Infrastructure and DevOps

- GitHub API heartbeat endpoint ([`6356411`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/6356411))
- Global error handler at root level ([`1b7e673`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/1b7e673))
- Production health checks ([`8868feb`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/8868feb))
- `.vercelignore` to exclude large diagnostic files ([`7274996`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/7274996))
- MIT License with OpenAI/Anthropic Rider ([`cba0345`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/cba0345))
- Dependencies updated to latest stable versions ([`be91511`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/be91511), [`eafc6f5`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/eafc6f5))
- Stricter TypeScript compiler settings ([`234ed46`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/234ed46))

---

## [v0.2.0] &mdash; Agentic Coding Tooling Flywheel

**Released**: 2025-12-15 &bull; **Tag**: [`v0.2.0`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/releases/tag/v0.2.0) &bull; **Commit**: [`045d0b7`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/045d0b7de1753018e815f3297126849c964e22e2)

### Added

- **Interactive Flywheel Visualization**: 7 interconnected tools in an animated circular layout with keyboard navigation, mobile bottom sheet, and reduced motion support ([`8251891`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/8251891))
- **Flywheel content and new projects**: Beads Viewer, Named Tmux Manager, Simultaneous Launch Button, CASS Memory System, Phage Explorer, Source to Prompt TUI, Chat to File, UltraSearch ([`f4d599b`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f4d599b))
- Flywheel preview banner on landing page ([`98b8206`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/98b8206))
- Expanded About page with detailed tool descriptions and CTAs ([`93bdaf7`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/93bdaf7))
- Projects page Flywheel integration and enhanced filtering ([`b225788`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/b225788))
- Beads issue tracking file with 24 tasks across 5 epics ([`1200c75`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/1200c75))

### Fixed

- Project card star regex for comma-formatted numbers (e.g., "1,001" now displays correctly) ([`4f20ca2`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/4f20ca2))
- Invisible dashed stroke animation on landing page flywheel preview ([`4f20ca2`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/4f20ca2))

### Changed

- All dependencies updated to latest versions (Next.js 16.0.10, React 19.2.3, etc.) ([`39e7576`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/39e7576))
- Hero CTAs updated for flywheel focus ([`4f20ca2`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/4f20ca2))

---

## [v0.1.0] &mdash; Initial Release

**Period**: 2025-11-21 &rarr; 2025-12-07 (pre-tag, no formal GitHub release) &bull; **First commit**: [`bd396c8`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/bd396c812c9d6f373e800ab1395d17efd4eaaf3b)

The initial build-out of the personal site from `create-next-app` scaffolding to a fully deployed portfolio.

### Foundation (2025-11-21)

- Scaffolded from Create Next App ([`bd396c8`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/bd396c8))
- Migrated to Bun as exclusive package manager with enforcement safeguards ([`8295058`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/8295058), [`603bad3`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/603bad3))
- Production error handling and Google Analytics tracking ([`e46e502`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/e46e502))
- Error boundaries integrated across the app ([`3292255`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/3292255))

### Content and Design (2025-11-22)

- 28 projects/articles added with live GitHub star counts ([`b4fe8d8`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/b4fe8d8))
- Professional headshot in multiple sizes ([`e6aabdb`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/e6aabdb))
- Hero section with enhanced visual hierarchy ([`f7a6115`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f7a6115))
- Comprehensive component redesign with violet theme ([`739ea55`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/739ea55))
- Global design system with violet accents and depth ([`36e63da`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/36e63da))
- Navigation header redesign with mobile menu ([`0161808`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/0161808))
- Interactive spotlight effect on project cards ([`e16e0aa`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/e16e0aa))
- Custom text selection styling ([`cbf1487`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/cbf1487))

### 3D Visualization

- Three.js scene with orbital rings using React Three Fiber ([`520e951`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/520e951))
- Network-aware quality scaling for Three.js ([`30b86c1`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/30b86c1))
- Three.js fallback for low-end mobile devices ([`5ca6fde`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/5ca6fde))

### Progressive Web App

- Full PWA support with service worker ([`82d7430`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/82d7430))
- PWA install prompt integration ([`f170d81`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/f170d81))

### Mobile and Performance

- Comprehensive mobile UX optimizations ([`9b5676a`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/9b5676a))
- Virtual scrolling for project cards ([`582ae73`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/582ae73))
- Custom performance and UX hooks ([`0aa2809`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/0aa2809))
- Scroll-blocking touchmove handler fix ([`5f5192d`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/5f5192d))
- Mobile UI overhaul with accessibility improvements ([`a6af94f`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/a6af94f))

### Writing System (2025-11-26)

- RSS feed support and writing articles system ([`4c942f5`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/4c942f5))

### Security (2025-12-07)

- Next.js updated to 16.0.7 to fix security vulnerability ([`a043f76`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/a043f76))
- React Flight packages updated for RCE advisory ([`35eec76`](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/commit/35eec76))

---

## Comparison Links

| Range | Link |
|-------|------|
| v0.2.0 &rarr; HEAD | [compare](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/compare/v0.2.0...main) |
| v0.1.0 (initial) &rarr; v0.2.0 | [compare](https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site/compare/bd396c8...v0.2.0) |

---

*This changelog was reconstructed from 741 commits across 2025-11-21 to 2026-03-21. Automated beads-sync, bd-daemon-sync, and stargazer-intelligence-update commits (~280 total) are omitted for readability.*

# Dependency Upgrade Log

**Date:** 2026-11-22  |  **Project:** jeffrey_emanuel_personal_site  |  **Language:** TypeScript / Next.js (bun)

## Summary
- **Updated:** 32 direct dependencies + transitive lockfile refresh (`katex` deduplicated via `overrides`)
- **Audit vulnerabilities:** `116 -> 0` total (`63 -> 0` production; `5 -> 0` critical, `57 -> 0` high, `47 -> 0` moderate, `7 -> 0` low)
- **Skipped major bumps:** `lucide-react` stayed on latest `0.577.0` (1.x removes brand icons `Github`/`Twitter`/`Linkedin`), `framer-motion` stayed on latest `12.43.0`, `typescript` stayed on `5.9.3`, `eslint` stayed on `9.39.5`
- **Failed:** 0

## Key Updates

| Package | Old | New |
|---------|-----|-----|
| next | 16.1.6 | 16.4.6 |
| eslint-config-next | 16.1.6 | 16.4.6 |
| react / react-dom | 19.2.4 | 19.3.1 |
| sharp | 0.34.5 | 0.35.5 |
| tailwindcss / @tailwindcss/postcss | 4.1.18 | 4.3.5 |
| zod | 4.3.6 | 4.6.7 |
| katex (incl. override) | 0.16.28 | 0.19.1 |
| three / @types/three | 0.182.0 | 0.187.0 |
| @react-three/fiber / drei / postprocessing | 9.5.0 / 10.7.7 / 3.0.4 | 9.8.2 / 10.7.9 / 3.2.2 |
| framer-motion | 12.34.0 | 12.43.0 |
| vitest | 4.0.18 | 4.1.12 |
| playwright / @playwright/test | 1.58.2 | 1.65.1 |
| lucide-react | 0.563.0 | 0.577.0 |

## Verification

- `bun audit --prod` & `bun audit` — 0 vulnerabilities (817 packages checked)
- `bunx tsc --noEmit` — 0 errors
- `bun run lint` — 0 errors, 0 warnings
- `bun run test:unit` — 26/26 files, 286/286 tests passing
- `bunx next build` — 56/56 static pages built cleanly

---

**Date:** 2026-01-18  |  **Project:** jeffrey_emanuel_personal_site  |  **Language:** Node.js (bun)

## Summary
- **Updated:** 6
- **Skipped:** 0
- **Failed:** 0
- **Needs attention:** 0

## Updates

| Package | Old | New |
|---------|-----|-----|
| @types/katex | 0.16.7 | 0.16.8 |
| jsdom | 27.3.0 | 27.4.0 |
| vitest | 4.0.16 | 4.0.17 |
| @react-three/fiber | 9.4.2 | 9.5.0 |
| feed | 5.1.0 | 5.2.0 |
| framer-motion | 12.23.26 | 12.27.0 |

## Verification

- `bun run build` - Build successful

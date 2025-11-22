# Jeffrey Emanuel - Personal Site

Modern personal portfolio site built with Next.js 16, TypeScript, Tailwind CSS v4, and React Three Fiber.

## ⚠️ IMPORTANT: BUN ONLY

**This project uses BUN as the package manager. DO NOT use npm, yarn, or pnpm.**

```bash
# ✅ Correct
bun install
bun run dev

# ❌ NEVER do this
npm install   # Will error
npm run dev   # Don't even think about it
```

The project has safeguards in place to prevent npm usage. If you accidentally try to use npm, you'll see an error message.

## Tech Stack

- **Next.js 16** (App Router) with React 19
- **TypeScript** with strict mode
- **Tailwind CSS 4.1** (new v4 architecture)
- **Framer Motion** for page transitions
- **React Three Fiber + Drei** for 3D visualization
- **GSAP** for advanced animations
- **Bun** as package manager

## Getting Started

Install dependencies and run the development server:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

**Google Analytics Setup:**

1. Get your GA4 Measurement ID from [Google Analytics](https://analytics.google.com/)
2. Add it to `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
3. Deploy to Vercel and add the same variable in Project Settings > Environment Variables

**Note:** You don't need to wait for your domain transfer to complete. GA will track whatever domain your site runs on (localhost, Vercel preview URLs, or your custom domain once configured).

## Available Scripts

```bash
# Development server
bun run dev

# Lint code
bun run lint

# Production build
bun run build

# Start production server locally
bun run start
```

## Project Structure

```
jeffreyemanuel-site/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Homepage
│   ├── about/             # About page
│   ├── consulting/        # Consulting services
│   ├── projects/          # Projects showcase
│   ├── writing/           # Writing & essays
│   ├── media/             # Press & media
│   └── contact/           # Contact page
├── components/            # React components
│   ├── analytics.tsx      # Google Analytics wrapper
│   ├── error-boundary.tsx # Error boundary for resilience
│   ├── hero.tsx           # Hero section with 3D scene
│   ├── three-scene.tsx    # WebGL visualization
│   └── ...                # Other reusable components
├── lib/
│   └── content.ts         # Centralized content management
└── public/                # Static assets
```

## Content Management

All site content is centralized in `lib/content.ts`:

- Site configuration (name, email, social links)
- Navigation items
- Projects data
- Career timeline
- Writing highlights
- Media appearances
- X threads

To update content, edit `lib/content.ts` - no need to touch individual page files.

## Features

- **Error Boundaries**: Graceful error handling with user-friendly fallbacks
- **Suspense & Loading States**: Smooth loading experience for async components
- **Google Analytics**: Production-ready analytics integration
- **3D Visualization**: Interactive Three.js scene with orbital rings
- **Smooth Animations**: Page transitions and scroll-triggered effects
- **Responsive Design**: Mobile-first with Tailwind CSS
- **TypeScript**: Full type safety across the codebase
- **SEO Optimized**: OpenGraph, Twitter cards, and semantic HTML

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_GA_ID` - Your Google Analytics measurement ID
4. Deploy

### Custom Domain Setup

Once your domain transfer completes:

1. Add `jeffreyemanuel.com` to your Vercel project
2. Update DNS records as instructed by Vercel
3. Google Analytics will automatically track the new domain

## Development Notes

- The site uses dynamic imports for the Three.js scene to reduce initial bundle size
- Error boundaries are implemented at both the app and component levels
- GSAP animations are properly cleaned up to prevent memory leaks
- All external links open in new tabs with `rel="noreferrer noopener"`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Framer Motion](https://www.framer.com/motion/)

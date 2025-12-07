---
title: "Next.js GitHub Markdown Blog System"
date: "2024-03-30"
excerpt: "Explains the architecture behind the open-source blogging engine. How to treat GitHub as a headless CMS, using static generation for speed and Git for version control."
category: "Web Dev"
author: "Jeffrey Emanuel"
source: "YTO"
---

I recently needed a blog for my recent Next.js app, [YouTube Transcript Optimizer](https://youtubetranscriptoptimizer.com/), and wanted something that would look really nice and that could be integrated into my existing Next.js app to keep deployment simple and to give me more control over how it's hosted and configured. 

My goal was to get something that looked very slick, using modern CSS styling and rich client-side effects that would look great on desktop and mobile, and most importantly, something that would be very easy and convenient for me to create new blog posts and edit existing posts. You may remember seeing my first real blog post made using this system, since I recently posted it [to HN](https://news.ycombinator.com/item?id=41859968). 

I realized that it could be useful to other people, so I decided to separate it from the rest of the my application into a standalone open-source [project](https://github.com/Dicklesworthstone/nextjs-github-markdown-blog) that can be easily integrated into an existing Next.js app to add blogging functionality, or just by itself. In this article, I'll explain how it all works and why I made it.

The core idea is straightforward: write Markdown files, push them to a GitHub repo, and let Next.js handle the rendering and delivery. It's turned out to be a surprisingly elegant solution that's both powerful and maintenance-free.

## How It Works

The system is built around a simple concept: your blog posts are just Markdown files in a GitHub repository. Each file starts with a YAML frontmatter block containing metadata:

```markdown
---
title: "Your Post Title"
date: "2024-03-30"
excerpt: "Brief description"
category: "Web Development"
tags: ["Next.js", "Tailwind CSS", "Blogging", "GitHub"]
coverImage: "https://raw.githubusercontent.com/Dicklesworthstone/yto_blog_posts/refs/heads/main/blog_01_banner.webp"
author: "Jeffrey Emanuel"
authorImage: "https://pbs.twimg.com/profile_images/1225476100547063809/53jSWs7z_400x400.jpg"
authorBio: "Software Engineer and Founder of YouTube Transcript Optimizer"

---

Your content here as markdown...
```

You can see what this looks like in practice using my last blog post which was linked above; [here](https://raw.githubusercontent.com/Dicklesworthstone/yto_blog_posts/main/02_what_i_learned_making_the_python_backend_for_yto.md?plain=1) is the corresponding markdown file for that blog post.

When the Next.js application builds, it:
1. Fetches these files from GitHub using their API
2. Parses the frontmatter to extract metadata
3. Transforms the Markdown into HTML
4. Generates static pages with proper routing
5. Adds interactive features like reading progress bars and smooth scrolling

The resulting pages are statically generated at build time, meaning they're nice and fast and can be hosted anywhere that serves static files.

## Why This Approach Works Well

### Technical Benefits
- **No Database**: Your content lives in Git, which you're already using
- **Version Control**: Full history of all changes, free branching and collaboration
- **No Backend**: Static files mean no server to maintain
- **Build-time Generation**: Pages are pre-rendered for optimal performance
- **Markdown + Git Flow**: Write posts in your favorite editor, push to deploy, without learning a new language

### Practical Advantages
- **Zero Maintenance**: No security updates, no database backups
- **Perfect for Developers**: Use the tools you already know
- **Instant Preview**: Run locally to see exactly how posts will look
- **Easy Collaboration**: Accept guest posts via pull requests
- **Free Hosting**: Can be hosted on Vercel or just using Next.js/nginx (this is what I do, since I'm already using that for my Next.js app!)

## The Technical Stack

The core functionality is built with:
- **Next.js 14**: For static generation and routing
- **gray-matter**: For parsing frontmatter
- **remark/rehype**: For Markdown processing
- **GitHub API**: For content fetching
- **Tailwind CSS**: For styling

## Core Architecture

The system architecture has three main components working together:

First, there's the GitHub repository that serves as our content store. This is just a collection of Markdown files, each representing a blog post. The files include YAML frontmatter at the top with metadata like titles, dates, and tags. You can also include images in the repo, or use a CDN or other host.

Second, we have the content fetching system. Using GitHub's REST API, we first get a list of all Markdown files in the repository. For each file, we then fetch its raw content. The system can optionally authenticate with GitHub using an access token (for private repos) and handles the API responses appropriately.

Once we have the raw files, we process them: the frontmatter is parsed using the `gray-matter` library to extract metadata, and the main content is processed through our Markdown pipeline. The posts are then sorted by date, with the most recent first.

## Markdown Processing Pipeline

The Markdown processing is handled through a pipeline built on the unified.js ecosystem. It works in several stages:

1. The raw Markdown text is first parsed into an Abstract Syntax Tree (AST) using `remark-parse`
2. This AST is then transformed into an HTML structure using `remark-rehype`
3. The HTML is sanitized to prevent XSS attacks using `rehype-sanitize`
4. Finally, the clean HTML is stringified into the final output

This pipeline is extensible - you can add transformations for things like syntax highlighting, math equations, or custom components by inserting additional processing steps. These aren't included yet, but could be added.

## Static Generation

Next.js handles the static generation of blog pages using its built-in static site generation features. At build time, the system:

1. Gets a list of all blog posts
2. For each post, generates a static page using the file name as the URL slug
3. Creates proper metadata including page titles and OpenGraph tags
4. Compiles everything into static HTML files

This process happens once at build time, resulting in a collection of pre-rendered HTML files that can be served extremely quickly.

## Rate Limiting and Caching

Since we're dependent on GitHub's API which has rate limits, we implement a smart caching system. When content is fetched from GitHub, it's saved to a local cache file. The cache entries include timestamps and expire after a configurable period - typically one hour in development and 24 hours in production.

Before making any API requests, the system checks for a valid cache entry. If found and not expired, it uses the cached content instead of making an API request. If the cache is missing or expired, it fetches fresh content from GitHub and updates the cache.

This caching system is particularly useful during development when you're making frequent changes and rebuilding often, as it prevents you from hitting GitHub's API rate limits.

## Getting Started

Setting up your own blog is simple:

1. Clone the repository 
2. Create a GitHub repository for your posts
3. Set up environment variables
4. Deploy

```bash
# Quick start using bun (https://bun.sh/docs/installation)
git clone https://github.com/Dicklesworthstone/nextjs-github-markdown-blog)
cd nextjs-github-markdown-blog
bun install
# Edit .env.local with your GitHub details, repo url, domain of your blog, etc.
bun run build
bun run start
```

## Comparison with Other Approaches

### WordPress
WordPress is powerful but comes with overhead:
- Requires database setup and maintenance
- Needs regular security updates
- Plugin compatibility issues
- Overkill for simple blogs
- Server costs and maintenance

This system replaces all that with a few static files and Git operations you're already doing. And even non-technical people can use the visual markdown preview tools in GitHub, and can have LLMs like ChatGPT take a plaintext post and turn it into markdown; the YAML frontmatter can then simply be compied and tweaked from a previous blog post.

### Medium
Medium is polished but limiting:
- Content lives on their platform
- Limited technical customization
- Can't integrate with your existing app
- Less control over SEO, monetization, and analytics

This approach gives you full control while maintaining simplicity.

### Custom Solutions
Building a custom blog often means:
- Setting up a database
- Creating an admin interface
- Building an editor
- Managing user sessions
- Handling image uploads

This system leverages GitHub's infrastructure for all of that.

### Static Site Generators (Jekyll, Hugo, etc.)
While excellent tools, traditional SSGs:
- Often require learning new templating languages
- Need separate deployment processes
- Can't easily integrate with existing Next.js apps
- Have their own complexity for themes and plugins

This approach integrates naturally with Next.js applications while maintaining the benefits of static generation.

## Performance Advantages

The system is pretty fast because:

- Pages are statically generated
- Images are automatically optimized
- Styles are purged and minimized
- JavaScript is minimal
- Content is served from the edge

## SEO Benefits

The system automatically generates rich metadata for every blog post. When a post is rendered, it extracts key information like the title, description, and cover image from the frontmatter. This data is then used to create comprehensive metadata tags including OpenGraph data for social media sharing. All of this happens at build time, so search engines and social media platforms get perfectly optimized content without any runtime overhead.

## Future Plans

I'm thinking about adding more features, but want to keep the emphasis on simplicity. Here are some things I would add if I can figure out a way to keep it slick and simple:

- 🔍 Full-text search capabilities
- 🌙 Dark mode support
- 📱Code Syntax Highlighting
- 📊 View analytics
- 💬 Comment system integration

## Conclusion

By leveraging GitHub as a CMS and combining it with Next.js, we've created a blogging platform that's:

- Simple to maintain
- Familiar to developers
- High-performing
- SEO-friendly
- Free to host

This post itself is written in Markdown (you can see the actual markdown itself [here](https://raw.githubusercontent.com/Dicklesworthstone/yto_blog_posts/main/03_nextjs_github_blogging_system.md)— how is that for meta?) and served through the system, demonstrating its capabilities. I believe this approach to blogging hits a sweet spot for developers and technical teams. It's simple enough to start using immediately but powerful enough to grow with your needs.

## Code

The complete source is available on [GitHub](https://github.com/Dicklesworthstone/nextjs-github-markdown-blog). Feel free to use it, modify it, or suggest improvements.
# GEMINI.md - Antoine Pouligny's Portfolio

## Project Overview
This is a personal portfolio website for Antoine Pouligny, a Senior Product Designer. It is built using **Astro 5**, **Tailwind CSS**, and **TypeScript**. The project is based on the *Astro Nano* theme but has been significantly customized with a unique ASCII/terminal aesthetic, featuring an animated ASCII background and ASCII-style shadow effects.

### Architecture & Tech Stack
- **Framework:** [Astro](https://astro.build/) (v5.x)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v3.x) with `@tailwindcss/typography`
- **Content Management:** Astro Content Collections (Markdown/MDX)
- **Icons/UI:** Custom SVG icons and modular Astro components
- **Type Safety:** TypeScript
- **Deployment:** GitHub Pages

## Key Directory Structure
- `src/pages/`: Main routes (`index.astro`, `blog/`, `projects/`, `work/`).
- `src/layouts/`: Shared layouts, primarily `PageLayout.astro`.
- `src/components/`: Reusable UI components.
  - `Container.astro` / `Container-md.astro`: Standard max-width containers for centering content.
  - `AsciiBackground.astro`: Implements the animated ASCII background.
  - `ArrowCard.astro` / `ArrowCardThumbnail.astro`: Standard card components for blog posts and projects.
  - `Link.astro`: Utility for styled internal/external links.
- `src/content/`: Data for Content Collections (blog, work, projects).
- `src/styles/`: Global styles (`global.css`) including grid animations and prose overrides.
- `src/lib/`: Utility functions like `cn` (tailwind-merge) and date formatting.
- `src/consts.ts`: Site-wide constants and metadata.

## Building and Running

### Development
```bash
npm run dev
```
Starts the Astro development server.

### Build
```bash
npm run build
```
Runs `astro check` (type checking) and `astro build` to generate the static site in the `dist/` directory.

### Linting
```bash
npm run lint      # Check for errors
npm run lint:fix  # Automatically fix errors
```

## Development Conventions

### Layout & Aesthetic System
The site has transitioned to an ASCII/terminal aesthetic.
- **Containers:** `Container.astro` (xl width) and `Container-md.astro` (md width) are used to wrap content sections.
- **Background:** `AsciiBackground.astro` provides an animated ASCII wave background using a canvas of characters (`.:-=+*#%@`).

### Styling Guidelines
- **Colors:** Default background is `#faf9f6` (light) and `slate-950` (dark).
- **Typography:** DM Sans (Sans) for UI, Fraunces (Serif) for body text/prose, and JetBrains Mono (Mono) for headings and accents.
- **Hover Effects:** Use the `.shadow-ascii` and `.shadow-hover` classes in `global.css` to trigger an interactive dotted/ASCII trailing shadow effect.

### Content Collections
- **Blog:** Uses standard Markdown with frontmatter (`title`, `description`, `date`).
- **Work:** Tracks professional experience with `company`, `role`, `dateStart`, and `dateEnd`.
- **Projects:** Includes a `thumbnail` field and links for `demoURL`/`repoURL`.

### Utilities
- Use the `cn()` utility from `@lib/utils` for conditional class merging.
- Use `dateRange()` for consistent formatting of work experience durations.

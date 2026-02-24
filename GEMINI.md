# GEMINI.md - Antoine Pouligny's Portfolio

## Project Overview
This is a personal portfolio website for Antoine Pouligny, a Senior Product Designer. It is built using **Astro 5**, **Tailwind CSS**, and **TypeScript**. The project is based on the *Astro Nano* theme but has been significantly customized with a unique "Construction" aesthetic, featuring visible grid lines and framed content areas.

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
  - `Container.astro`: Implements the core 10-column grid system and vertical background lines.
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

### 10-Column Grid System
The site uses a custom 10-column grid system implemented in `Container.astro`. 
- **Desktop (md):** Columns are 10% wide each.
- **Construction Lines:** Vertical lines are placed at every 10% interval using `absolute` positioning and `border-l`.
- **Framing:** Key sections (like the intro on the home page) use a framed container with an opaque background (`bg-[#faf9f6]`) and `z-10` to hide underlying grid lines.
- **Alignment:** When adding framed containers, use `md:-mr-px` or similar negative margins to ensure borders perfectly overlap with the background grid lines (which are typically `border-l` on the subsequent column).

### Styling Guidelines
- **Colors:** Default background is `#faf9f6` (light) and `slate-950` (dark).
- **Typography:** Inter (Sans) for UI and Lora (Serif) for body text/prose.
- **Hover Effects:** Use the `.container-grid:has(...)` pattern in `global.css` to trigger "dashed" line animations when hovering over specific elements.
- **Opaque Backgrounds:** When framing elements to hide grid lines, ensure you use the theme's background colors to maintain the "card" effect.

### Content Collections
- **Blog:** Uses standard Markdown with frontmatter (`title`, `description`, `date`).
- **Work:** Tracks professional experience with `company`, `role`, `dateStart`, and `dateEnd`.
- **Projects:** Includes a `thumbnail` field and links for `demoURL`/`repoURL`.

### Utilities
- Use the `cn()` utility from `@lib/utils` for conditional class merging.
- Use `dateRange()` for consistent formatting of work experience durations.

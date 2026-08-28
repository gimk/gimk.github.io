---
title: "Vibe Coding projects"
description: "Some small websites I built recently"
date: "June 12, 2026"
thumbnail: "/projectfiles/thumbnails/camera-thumbnail.png"
---

Over the past few weeks, I built a number of websites, apps, and projects using what I now think of as a new way of working: **Vibe Coding**. Each project started as a clear idea, and was brought to life in a few evenings using mostly **Antigravity** and a sprinkle of **Claude Code** as accelerators. Most projects were built with <a href="https://astro.build" target="_blank" rel="noopener noreferrer">**Astro**</a> or <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">**React + Vite**</a> and deployed on <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer">**GitHub Pages**</a> with custom domains — a stack I've now become very comfortable with.

## A Note on Vibe Coding

All of these projects were built in heavily AI-assisted sessions. The AI handled the scaffolding, the boilerplate, and the tedious back-and-forth with config and types. I handled the design decisions, the content, and the ideas.

I quickly realized that 90% of a project gets done in 10% of the time — what truly takes effort is the refinement. Fortunately, it's something I love doing, and it feels seamless now: working with AI agents is like pairing with a senior engineer who has infinite patience.

---

## The Projects

### 📷 Photos Gallery — <a href="https://photos.pantoine.com" target="_blank" rel="noopener noreferrer">photos.pantoine.com</a>

![Preview of photos.pantoine.com — a minimalist digital exhibition with a disclaimer screen and subtle blue-tinted background](/projectfiles/vibe-coding-trilogy/photos-cover.png)

A personal photography gallery built as a digital exhibition for a slower viewing experience. The interface is minimal: a centered disclaimer appears first, suggesting a slower pace. Navigation is scroll or keyboard-based, and each photograph fills the screen.

#### The Technical Side

The main technical feature is the **dynamic background color system**. During the Astro build, the site fetches a small version of each image (400px) and runs it through **node-vibrant** to extract a primary color. The logic prioritizes the `Vibrant` swatch, falling back to `DarkVibrant`, `Muted`, or `LightVibrant`. This pre-computed color sets a subtle background for each photograph without runtime processing.

#### What's Next

- A **collection system** is in the works, to group photographs by theme, trip, or mood.
- A **new navigation pattern** to move between photographs in a more expressive way.

---

### 🎞️ Simulation Recipes — <a href="https://fujisims.pantoine.com" target="_blank" rel="noopener noreferrer">fujisims.pantoine.com</a>

![Preview of fujisims.pantoine.com — a dark, cinematic film protocol archive with serif typography and film simulation recipe cards](/projectfiles/vibe-coding-trilogy/fujisims-cover.png)

A Fujifilm X-System film simulation archive. Each entry is a custom recipe with specific in-camera settings that define a photographic look — from something close to classic Kodak tones to more modern, desaturated chrome aesthetics. The site presents them as a clean archive with a dark, film-protocol aesthetic.

#### The Technical Side

Built around an Astro content collection for recipes, with a **dark, cinematic design system** built in vanilla CSS. Each recipe card is dynamically generated from a typed Markdown file defining the film base, in-camera adjustments, and a set of sample photographs. EXIF data is extracted at build time using **exifr** and displayed on each photo card within the recipe detail page.

It also features a **full serverless community submission flow**:

1. **Public `/submit` page** — an anonymous form covering recipe parameters and photo uploads without requiring an account.
2. **Client-side image compression** — canvas-based resizing down from ~25MB camera JPEGs to 1–3MB at 85% quality.
3. **Cloudflare Worker** — verifies Cloudflare Turnstile CAPTCHA and automatically opens a GitHub Pull Request with the Markdown and image assets.
4. **GitHub PR as admin panel** — review and merge directly on GitHub to trigger CI/CD deployment.

#### What's Next

- The community submission system is now live — anyone can submit a recipe without an account.
- Considering adding a **comparison mode** to show the same scene with different simulations side by side.

---

### 🍽️ Antoine's Kitchen — <a href="https://recipes.pantoine.com" target="_blank" rel="noopener noreferrer">recipes.pantoine.com</a>

![Preview of Antoine's Kitchen — a structured recipe grid with monospaced typography, category filters, and monochrome food photography](/projectfiles/vibe-coding-trilogy/recipes-cover.png)

A personal recipe website born from my background as a home cook with a cooking license. The recipes here are refined through repeated sessions and carry the kind of personal notes that never make it into a cookbook. Clean, structured, and grid-based — it's the technical side of cooking made visible.

#### The Technical Side

The site uses **Astro Content Collections** with typed MDX frontmatter to structure every recipe. An embedded **React Island** handles interactive cooking timers. Styling uses **Tailwind CSS** with a custom light blue, CRT-style design system. AI handled schema wiring, component boilerplate, image generation, and CSS refactoring — the repetitive setup work that usually takes hours.

#### What's Next

- The collection is small but growing. Many more recipes to document and share — this is just the foundation.
- Thinking about adding a **lexicon page** for culinary techniques.
- I would like to redo the design system from the ground up, to something more rounded, fancy, and warm. More in line with cooking actually.

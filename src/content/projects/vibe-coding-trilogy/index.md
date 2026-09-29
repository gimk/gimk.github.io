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

![Preview of photos.pantoine.com — a black index page showing a grid of photographs, with a serif header, an image count, a scrolling marquee, and About and Collections links](/projectfiles/vibe-coding-trilogy/photos-cover.png)

A personal photography gallery, redesigned from the ground up. It used to be a one-photo-at-a-time exhibition. It now opens on a **black index of every photograph** (144 so far) laid out as a loose grid. A thin serif header carries the image count, a scrolling marquee, an About page and a **Collections** menu. Click any photo to open it full screen, then move through it with the arrow keys and close it with Escape.

#### The Technical Side

The collection system I had planned is now live. Photographs are grouped into **25 dated collections**, from trips to single evenings, going back to 2020. Each one can be browsed on its own and linked to directly, down to a single image (e.g. `#Eclipse/1`). The zoom view also shows each photo's **EXIF data** on demand.

The **build-time color extraction** from the first version is still there. During the Astro build, a small version of each image goes through **node-vibrant** to pull out a primary color. That color is stored with the photo, so no processing happens in the browser.

#### What's Next

- Keep adding collections as I shoot. The new index makes the archive feel like it can grow indefinitely.
- Find a new use for the **extracted colors**. They're still computed for every photo, but the new design doesn't use them yet.

---

### 🎞️ Pixel Looks — <a href="https://pixelooks.pantoine.com" target="_blank" rel="noopener noreferrer">pixelooks.pantoine.com</a>

![Preview of pixelooks.pantoine.com — a dark, cinematic look archive with serif typography and full-bleed photo cards](/projectfiles/vibe-coding-trilogy/fujisims-cover.png)

A photographic look archive, built around the Pixel 11. Each entry is a *look*: a set of capture and grading settings that define a specific rendering, from a neon digital 90s feel to muted editorial monochrome or straight black-and-white. The site presents them as a numbered archive with a dark, protocol-like aesthetic.

It started life as a Fujifilm X-System film simulation archive. I still have the X-T5, but there are already plenty of Fuji recipe sites out there and I wasn't adding anything to that. The Pixel looks are new and nobody is archiving them yet, so building the tool for those felt a lot more useful.

#### The Technical Side

Built around an Astro content collection for looks, with a **dark, cinematic design system** built in vanilla CSS. Each look card is dynamically generated from a typed Markdown file defining the base rendering, the adjustments, and a set of sample photographs. EXIF data is extracted at build time using **exifr** and displayed on each photo card within the look detail page.

It also features a **full serverless community submission flow**:

1. **Public `/submit` page** — an anonymous form covering look parameters and photo uploads without requiring an account.
2. **Client-side image compression** — canvas-based resizing of large uploads down to 1–3MB at 85% quality.
3. **Cloudflare Worker** — verifies Cloudflare Turnstile CAPTCHA and automatically opens a GitHub Pull Request with the Markdown and image assets.
4. **GitHub PR as admin panel** — review and merge directly on GitHub to trigger CI/CD deployment.

#### What's Next

- The community submission system is now live — anyone can submit a look without an account.
- Considering adding a **comparison mode** to show the same scene with different looks side by side.

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

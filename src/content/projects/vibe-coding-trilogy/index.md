---
title: "Photo Portfolio"
description: "photos.pantoine.com, a home I designed and built for my photographs"
date: "June 12, 2026"
thumbnail: "/projectfiles/thumbnails/camera-thumbnail.png"
demoURL: "https://photos.pantoine.com"
demoLabel: "visit site"
repoURL: "https://github.com/gimk/photos.pantoine.com"
repoLabel: "view on GitHub"
---

![The index of photos.pantoine.com: every photograph as a small thumbnail on a black page, under a thin serif header with the image count, a scrolling marquee, About and Collections](/projectfiles/vibe-coding-trilogy/photos-index.jpg)

<a href="https://photos.pantoine.com" target="_blank" rel="noopener noreferrer">**photos.pantoine.com**</a> is where my photographs live, grouped in collections going back to 2020. Trips, single evenings, people, places.

The first version was a slow, one-photo-at-a-time exhibition. It worked for a handful of images, but not for an archive that keeps growing. So I rebuilt it from the ground up around a simple idea: see everything at once, then look at one photo properly.

---

## Two Ways In

**The index** is the home page: every photograph as a small thumbnail on a black page, newest collection first. Hovering a thumbnail shows its collection's name in the top-left corner. There's also a hidden extra: dragging the marquee in the header changes the number of columns, fewer for bigger photos, more to see the whole archive. Double-click it to go back.

![The collections view: a white page where each collection gets one large cover photo, with its title, date and image count](/projectfiles/vibe-coding-trilogy/photos-feed.jpg)

**The collections** view flips to a white page, where each collection is a single large cover with its title, date and number of images. The `I` key switches between the two.

The collections view also has a **timeline** on the right edge of the screen: one small line per collection, grouped under year headings. It stays discreet until you hover it, then spreads out to show every name. Clicking one scrolls straight to it.

---

## The Viewer

![The full-screen viewer on two collections side by side: a snowy mountain on a slightly blue background, and a portrait with eclipse glasses on a warm brown one, each with its EXIF line at the bottom](/projectfiles/vibe-coding-trilogy/photos-viewer.jpg)

Clicking a photo makes it fly from its thumbnail to the centre of the screen and grow to full size. Closing sends it back to its place on the page, scrolling the page if needed. The photo should always feel like the same object, never a new page loading.

Once open, the left half of the photo goes back, the right half goes forward, and clicking above or below closes it. A small label follows the cursor to say which. Arrow keys and Escape work too. Each photo shows its camera, lens and exposure settings, and has its own link (like `#Eclipse/3`), so the back button and shared links both land on the right image.

On a phone, the photo follows your finger. Swipe sideways to move to the next one, which is already waiting just off the edge, or swipe up or down to send it back to its thumbnail.

I spent a significant amount of time making these interactions fluid, responsive and up to today's standards. That's why the site has touch gestures, loading placeholders, large tap targets and a press effect on phones, among other things. A photo gallery lives or dies by how it feels to browse.

---

## Colour

Each photograph gets one colour at build time, the most present swatch picked by **node-vibrant**. In the first version it tinted the background behind each photo. Now it's used in quieter places:

- **Loading:** a photo that takes a moment to load shows its colour in its place, then comes in out of a blur.
- **Viewer background:** the black takes an 8% tint of the collection's colour, and eases from one collection's to the next as you browse. In the image above, the same black turns blue for the snow and warm for the eclipse portraits.
- **Phone toolbar:** the browser's toolbar follows the background, black on the index, white on the collections, tinted in the viewer.
- **About palette:** every photo appears as a dot of its colour, in order. Clicking a dot opens its photo.

![The About overlay: a short description, a contact line for prints, links elsewhere, keyboard shortcuts, and a palette of small coloured dots, one per photograph](/projectfiles/vibe-coding-trilogy/photos-about.jpg)

---

## Under the Hood

Built with **Astro**, TypeScript and plain CSS, with **Fraunces** as the only typeface, and deployed on GitHub Pages. It's a single page: the index, collections, viewer and About are all states of it, kept in the URL so links and the back button work.

Adding photos takes one command. I drop the camera files into a folder, and a script writes a 3000px web master for each one, keeping the camera data. It also creates a small `series.json` per collection, where I can set a title, alt text, captions or a different colour. At build time, Astro generates the WebP versions the site shows and strips their metadata, so no GPS location ever ends up online. **exifr** reads the camera settings shown in the viewer.

Like my other recent projects, it was built in AI-assisted sessions: the agents handled the boilerplate, while I spent my time on the movement, the details and the photos themselves.

---

## Side Projects From the Same Time

I started these two sites alongside the first version of the photo portfolio. They still work, but I haven't kept them up to date.

### 🎞️ Pixel Looks — <a href="https://pixelooks.pantoine.com" target="_blank" rel="noopener noreferrer">pixelooks.pantoine.com</a>

![Preview of pixelooks.pantoine.com — a dark, cinematic look archive with serif typography and full-bleed photo cards](/projectfiles/vibe-coding-trilogy/fujisims-cover.png)

An archive of photographic looks for the Pixel 11: sets of capture and grading settings, each shown with sample photos and their EXIF data. Anyone can submit a look without an account, and each submission becomes a GitHub pull request I can review and merge.

### 🍽️ Antoine's Kitchen — <a href="https://recipes.pantoine.com" target="_blank" rel="noopener noreferrer">recipes.pantoine.com</a>

![Preview of Antoine's Kitchen — a structured recipe grid with monospaced typography, category filters, and monochrome food photography](/projectfiles/vibe-coding-trilogy/recipes-cover.png)

My recipes, refined over many sessions at home, with the personal notes that never make it into a cookbook. It has a structured grid, category filters and built-in cooking timers. The collection is still small.

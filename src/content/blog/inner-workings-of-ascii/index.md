---
title: "The math behind the ASCII wave"
description: "A deep dive into the mathematical implementation and performance optimization of this site's ASCII animations."
date: "2026-02-26"
---

When I set out to redesign this portfolio, I wanted a visual element that felt both technical and organic—something that could provide **texture** in a world of smooth gradients. By using ASCII characters as a medium for motion, the background provides a grainy, tactile grit that feels "built" rather than just rendered. The result was the ASCII wave animations you see throughout the site.

In this post, I'll break down how these animations work, from the math behind the waves to the performance tricks that keep the CPU usage in check.

## The Core Concept

At its heart, the ASCII animation is a grid of characters that updates at a fixed interval (around 24-30 frames per second). Each cell in the grid calculates its "intensity" based on its position and the current time, then maps that intensity to a specific character from a density string.

### The Density String

We use a string of characters ordered from lowest to highest visual weight:

```typescript
const density = " .:-=+*#%@";
```

A space represents the "quietest" part of the wave, while the `@` symbol represents the peak.

## The Mathematics of the Wave

To create the organic, flowing motion, I used a combination of multiple sine and cosine waves. This technique, often called "Plasma" in the early demoscene days, creates complex, non-repeating patterns from simple periodic functions.

The core calculation for a single cell at `(x, y)` looks like this:

```typescript
const dx = (x - centerX) * 0.6; // Adjust for character aspect ratio
const dy = y - centerY;
const distance = Math.sqrt(dx * dx + dy * dy);

const wave =
  Math.sin(distance * 0.15 - time) * 0.6 + // Circular wave
  Math.cos(dx * 0.08 + time * 0.5) * 0.2 + // Horizontal shift
  Math.sin(dy * 0.08 + time * 0.5) * 0.2; // Vertical shift
```

By combining these three waves, we get a pattern that feels like ripples in a pond but with a bit more complexity and "vibe."

## Performance Optimization

Rendering 120,000+ characters (the background grid size) every frame can be extremely taxing on the CPU. Here are the three main strategies I implemented to keep the site smooth:

### 1. FPS Throttling

Modern browsers run `requestAnimationFrame` at 60Hz or higher. For a decorative ASCII animation, that's overkill. I capped the frame rate to **24 FPS**, which reduces the workload by over 60% while maintaining a "cinematic" feel.

### 2. Visibility Management

There's no point in animating what the user can't see. Using the `IntersectionObserver` API, the animations automatically pause when they scroll out of view.

```typescript
const observer = new IntersectionObserver(
  ([entry]) => {
    isVisible = entry.isIntersecting;
  },
  { threshold: 0 },
);
observer.observe(container);
```

### 3. Loop Optimization

In the Hero section, I added a "trail influence" where the mouse cursor creates ripples. Calculating the distance to every single mouse trail point for every single pixel is expensive—specifically, it has a complexity of **O(pixels × trailPoints)**.

In plain English, this means the processing time grows as you increase either the size of the grid (pixels) or the number of active trail points. If you have 10,000 pixels and 200 trail points, you're performing 2 million distance calculations every single frame.

To fix this, I added a simple bounding box check to skip the expensive square root calculation if a pixel is clearly outside the cursor's influence radius. This effectively brings the cost down for most of the grid, ensuring that even with a large number of trail points, the animation remains performant.

## Conclusion

ASCII art is a reminder that we can create beautiful, complex experiences using the simplest possible primitives. It's not about the resolution of the image, but the math and the feeling behind the motion.

Hope you enjoyed this technical peek under the hood!

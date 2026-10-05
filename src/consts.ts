import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Antoine Pouligny's Portfolio",
  EMAIL: "a.pouligny@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 2,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Hey I'm Antoine Pouligny, a Product Designer, welcome to my portfolio.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics Antoine Pouligny is passionate about.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where Antoine Pouligny has worked and what he has done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of Antoine Pouligny's projects, with links to demos.",
};

export const SOCIALS: Socials = [
  { 
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/antoine-pouligny/",
  },
  { 
    NAME: "github",
    HREF: "https://github.com/gimk",
  },
  {
    NAME: "unsplash",
    HREF: "https://unsplash.com/@gimmick/"
  }
] as const;

export const NEW_PROJECT = {
  HREF: "https://photos.pantoine.com",
} as const;

export const APPS = [
  {
    NAME: "Comp",
    DESCRIPTION: "Modular compositing",
    TAGLINE: "Wire pictures and video through effect modules, live in the browser.",
    HREF: "https://comp.pantoine.com",
    ICON: "nodes",
    MOTION: "comp",
    FEATURED: true,
  },
  {
    NAME: "Colors",
    DESCRIPTION: "OKLCH palette builder",
    HREF: "https://colors.pantoine.com",
    ICON: "palette",
  },
  {
    NAME: "Dither Studio",
    DESCRIPTION: "Dithering in the browser",
    HREF: "https://studio.pantoine.com",
    ICON: "dither",
  },
  {
    NAME: "Photos",
    DESCRIPTION: "My photography portfolio",
    HREF: "https://photos.pantoine.com",
    ICON: "camera",
  },
] as const;

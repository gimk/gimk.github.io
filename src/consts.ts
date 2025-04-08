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
    NAME: "instagram",
    HREF: "https://www.instagram.com/antoinepoups/",
  },
  {
    NAME: "unsplash",
    HREF: "https://unsplash.com/@gimmick/"
  }
];

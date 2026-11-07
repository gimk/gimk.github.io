import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Antoine Pouligny's Portfolio",
  EMAIL: "a.pouligny@gmail.com",
};

export const HOME: Metadata = {
  TITLE: "Antoine Pouligny, Creative Engineer & Senior Product Designer",
  DESCRIPTION: "Hey I'm Antoine Pouligny, a Creative Engineer and Product Designer, welcome to my portfolio.",
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

import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.pantoine.com",
  integrations: [mdx(), sitemap()],
  server: {
    port: 49155
  }
});

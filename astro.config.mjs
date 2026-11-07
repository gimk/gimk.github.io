import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.pantoine.com",
  integrations: [sitemap()],
  server: {
    port: 49155
  }
});

import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const name = url.searchParams.get("name");
  
  if (import.meta.env.DEV && name) {
    console.log(`\x1b[36m[ASCII]\x1b[0m Current animation: \x1b[33m${name}\x1b[0m`);
  }
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
};

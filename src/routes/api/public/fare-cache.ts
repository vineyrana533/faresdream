import { createFileRoute } from "@tanstack/react-router";

// Public, unauthenticated fare cache endpoint for external static SEO pages.
export const Route = createFileRoute("/api/public/fare-cache")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { fareCacheOptions } = await import("@/lib/fare-cache.server");
        return fareCacheOptions();
      },
      GET: async ({ request }) => {
        const { handleFareCacheGet } = await import("@/lib/fare-cache.server");
        return handleFareCacheGet(request);
      },
      POST: async ({ request }) => {
        const { handleFareCachePost } = await import("@/lib/fare-cache.server");
        return handleFareCachePost(request);
      },
    },
  },
});

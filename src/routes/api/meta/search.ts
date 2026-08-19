import { createFileRoute } from "@tanstack/react-router";

// Canonical supplier endpoint. Same handler as /api/public/meta/search.
export const Route = createFileRoute("/api/meta/search")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { metaSearchOptions } = await import("@/lib/meta-search-handler.server");
        return metaSearchOptions();
      },
      POST: async ({ request }) => {
        const { handleMetaSearch } = await import("@/lib/meta-search-handler.server");
        return handleMetaSearch(request);
      },
    },
  },
});

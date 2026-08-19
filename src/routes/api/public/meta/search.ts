import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/meta/search")({
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

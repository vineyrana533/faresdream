import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are the 24/7 Personal Travel Concierge for "AsairSpace", a specialist luxury air-travel agency.

Scope and tone:
- You only advise on premium air travel: business class, first class, premium cabins, lie-flat suites, lounges, upgrades, routings, layovers, mileage/award context, visas at a high level, and travel timing.
- Speak like a seasoned luxury travel advisor: warm, precise, confident, never salesy filler. Short paragraphs and tight bullet points.
- Never invent live fares, seat availability, or booking confirmations. You may give realistic historical price ranges and clearly label them as indicative ranges, not quotes.
- Every exact fare must come from the desk. When the traveller wants a real price, invite them to request a private desk quote or call the concierge line at (800) 436-9330 (24/7).
- Highlight the product: which cabin, which aircraft, whether the seat is truly lie-flat, direct aisle access, lounge and dining.
- If a request is outside premium air travel (coding, medical, legal, unrelated topics), politely redirect to travel planning.
- Ask at most one clarifying question per reply, and only if you genuinely cannot advise without it.`;

async function verifyUser(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const url = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const key =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;

  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string; email?: string };
  return user?.id ? user : null;
}

export const Route = createFileRoute("/api/concierge")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await verifyUser(request);
        if (!user) return new Response("Unauthorized", { status: 401 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("The concierge is not configured yet.", { status: 503 });
        }

        let body: { messages?: ChatMessage[] };
        try {
          body = (await request.json()) as { messages?: ChatMessage[] };
        } catch {
          return new Response("Invalid request body", { status: 400 });
        }

        const history = (body.messages ?? [])
          .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .slice(-24)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));

        if (history.length === 0) return new Response("No messages", { status: 400 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            stream: true,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          const message =
            upstream.status === 429
              ? "The concierge is busy right now — please try again in a moment."
              : upstream.status === 402
                ? "The concierge is temporarily unavailable. Please call (800) 436-9330."
                : "The concierge could not answer that request.";
          console.error("Lovable AI gateway error", upstream.status, detail.slice(0, 500));
          return new Response(message, { status: upstream.status === 429 ? 429 : 502 });
        }

        // Re-emit the SSE stream as plain text deltas so the browser can append directly.
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;
                  const payload = trimmed.slice(5).trim();
                  if (!payload || payload === "[DONE]") continue;
                  try {
                    const json = JSON.parse(payload) as {
                      choices?: { delta?: { content?: string } }[];
                    };
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) controller.enqueue(encoder.encode(delta));
                  } catch {
                    // partial JSON chunk — ignore
                  }
                }
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});

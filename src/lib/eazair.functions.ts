import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const postbackInput = z.object({
  clickId: z.string().min(1).max(160),
  pnr: z.string().min(3).max(32),
  amount: z.number().nonnegative(),
  currency: z.string().min(3).max(6).optional(),
  route: z.string().max(64).optional(),
  source: z.string().max(80).optional(),
});

/**
 * Manual/replay affiliate postback to EazAir. The normal booking flow fires
 * the postback inside `createBooking` once all rows have committed.
 */
export const notifyEazairWebhook = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => postbackInput.parse(data))
  .handler(async ({ data }) => {
    const { isAttributable, sendEazairPostback } = await import("./eazair-postback.server");
    if (!isAttributable(data.source ?? "eazair", data.clickId)) {
      return { sent: false as const, reason: "not_attributable" as const };
    }
    const res = await sendEazairPostback({
      clickId: data.clickId,
      pnr: data.pnr,
      route: (data.route ?? "").toUpperCase(),
      amount: data.amount,
      currency: data.currency ?? "USD",
    });
    return { sent: res.sent };
  });

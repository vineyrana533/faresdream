import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const searchSchema = z.object({
  origin: z.string().min(3).max(4),
  destination: z.string().min(3).max(4),
  departDate: z.string().min(8).max(10),
  returnDate: z.string().min(8).max(10).optional(),
  adults: z.number().int().min(1).max(9).optional(),
  children: z.number().int().min(0).max(9).optional(),
  infants: z.number().int().min(0).max(9).optional(),
  cabinClass: z.enum(["Economy", "PremiumEconomy", "Business", "First"]).optional(),
  currency: z.string().min(3).max(3).optional(),
  solutions: z.number().int().min(1).max(50).optional(),
  airline: z.string().max(3).optional(),
});

/** Searches live PKFARE inventory on the server; credentials stay server-side. */
export const searchPkfare = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => searchSchema.parse(input))
  .handler(async ({ data }) => {
    const { runPkfareSearch } = await import("./pkfare.server");
    return runPkfareSearch(data);
  });

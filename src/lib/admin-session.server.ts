import { useSession } from "@tanstack/react-start/server";

export type AdminSession = { admin?: boolean };

export function adminSessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "bcd-admin",
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      partitioned: true,
      path: "/",
    },
  };
}

/** Returns true when the caller holds a valid signed admin session cookie. */
export async function isAdminRequest(): Promise<boolean> {
  const session = await useSession<AdminSession>(adminSessionConfig());
  return session.data.admin === true;
}

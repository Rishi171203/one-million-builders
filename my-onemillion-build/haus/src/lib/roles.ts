// haus — one place that decides where each kind of user "lives".
//
// After signing in, a buyer wants the advisor, a homeowner wants their tools,
// and an admin wants the builder dashboard. Keeping this in a single helper
// means the login page (browser) and the OAuth callback (server) always agree.

export type Role = "buyer" | "owner" | "admin";

export function roleHome(role: string | null | undefined): string {
  if (role === "owner") return "/owner";
  if (role === "admin") return "/admin";
  return "/advisor"; // buyers (and any unknown role) land in the advisor
}

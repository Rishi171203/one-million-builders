import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { roleHome } from "@/lib/roles";

// Exchanges the OAuth/code for a session (used by Google sign-in + email confirmation links).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Honour an explicit destination, otherwise send them to their role home.
      if (next && next.startsWith("/")) return NextResponse.redirect(`${origin}${next}`);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let role: string | null = null;
      if (user) {
        const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        role = p?.role ?? "buyer";
      }
      return NextResponse.redirect(`${origin}${roleHome(role)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

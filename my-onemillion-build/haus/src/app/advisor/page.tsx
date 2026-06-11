import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdvisorClient from "./AdvisorClient";

// The advisor is the real app — gated behind login. Logged-out visitors are
// sent to /login (the public marketing homepage at "/" is the front door).
export default async function AdvisorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <AdvisorClient />;
}

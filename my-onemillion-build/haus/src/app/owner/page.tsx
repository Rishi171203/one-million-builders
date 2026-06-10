import { redirect } from "next/navigation";
import { Container, Typography, Paper } from "@mui/material";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import OwnerTools from "./OwnerTools";

export default async function OwnerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role ?? "buyer";
  if (role !== "owner" && role !== "admin") redirect("/dashboard");

  return (
    <>
      <DashboardHeader email={user.email ?? ""} role={role} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Your home, optimised 🔑</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Homeowner tools to make the most of what you already own.</Typography>

        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          <OwnerTools />
        </Paper>
      </Container>
    </>
  );
}

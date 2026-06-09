import { redirect } from "next/navigation";
import { Container, Box, Typography, Paper } from "@mui/material";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role ?? "buyer";
  if (role !== "admin") redirect("/dashboard");

  // Lightweight live stats (more analytics added in the admin sprint).
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: buyers } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "buyer");
  const { count: owners } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "owner");

  const stats = [
    { label: "Total users", value: totalUsers ?? 0 },
    { label: "Homebuyers", value: buyers ?? 0 },
    { label: "Homeowners", value: owners ?? 0 },
  ];

  return (
    <>
      <DashboardHeader email={user.email ?? ""} role={role} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Builder dashboard 🛠️</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Your product at a glance.</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 2.5, mb: 3 }}>
          {stats.map((s) => (
            <Paper key={s.label} elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="overline" color="text.secondary">{s.label}</Typography>
              <Typography variant="h3">{s.value}</Typography>
            </Paper>
          ))}
        </Box>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>More analytics coming</Typography>
          <Typography variant="body2" color="text.secondary">
            Assessments run, “this helped me” counts, country breakdown, and recent activity will appear here
            once we add saved assessments (next sprints).
          </Typography>
        </Paper>
      </Container>
    </>
  );
}

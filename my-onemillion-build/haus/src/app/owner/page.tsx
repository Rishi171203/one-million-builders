import { redirect } from "next/navigation";
import { Container, Box, Typography, Paper, Chip } from "@mui/material";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";

const TOOLS = [
  { t: "Prepay / refinance", d: "Should you prepay your loan or refinance to a lower rate? See how much interest you'd save." },
  { t: "Equity tracker", d: "Enter your home's current value and outstanding loan to see your equity and payoff progress." },
  { t: "Sell vs. rent-out", d: "Thinking of moving? Compare selling now versus renting your place out." },
];

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

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          {TOOLS.map((tool) => (
            <Paper key={tool.t} elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6">{tool.t}</Typography>
                <Chip label="Coming soon" size="small" sx={{ bgcolor: "primary.light", color: "primary.dark", fontWeight: 600 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">{tool.d}</Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </>
  );
}

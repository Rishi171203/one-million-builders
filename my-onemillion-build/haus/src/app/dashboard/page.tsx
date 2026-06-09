import { redirect } from "next/navigation";
import { Container, Box, Typography, Paper, Button } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role ?? "buyer";
  if (role === "owner") redirect("/owner");
  if (role === "admin") redirect("/admin");

  return (
    <>
      <DashboardHeader email={user.email ?? ""} role={role} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Welcome back 👋</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Your homebuyer dashboard.</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Get advice</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Run the advisor to see what you can afford and whether to buy now.
            </Typography>
            <Button href="/" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
              Open the advisor
            </Button>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Saved advice</Typography>
            <Typography variant="body2" color="text.secondary">
              Your saved assessments and history will appear here. (Coming next sprint.)
            </Typography>
          </Paper>
        </Box>
      </Container>
    </>
  );
}

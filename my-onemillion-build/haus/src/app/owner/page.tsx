import { redirect } from "next/navigation";
import { Container, Typography, Paper, Box, Stack } from "@mui/material";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import OwnerTools from "./OwnerTools";
import DashboardHero from "@/components/DashboardHero";
import Reveal from "@/components/Reveal";
import { HOME_GALLERY } from "@/lib/photos";

export default async function OwnerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role ?? "buyer";
  if (role !== "owner" && role !== "admin") redirect("/dashboard");

  const highlights = [
    { icon: <SavingsRoundedIcon />, title: "Prepay & refinance", body: "See the interest you'd save and how many years sooner you'd be loan-free." },
    { icon: <TrendingUpRoundedIcon />, title: "Equity tracker", body: "Know exactly how much of your home you truly own as it grows." },
    { icon: <CompareArrowsRoundedIcon />, title: "Sell vs. rent-out", body: "Weigh the lump sum from selling against steady rental income." },
  ];

  return (
    <>
      <DashboardHeader email={user.email ?? ""} role={role} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <DashboardHero
          photo={HOME_GALLERY[3]}
          eyebrow="Homeowner tools"
          title="Your home, optimised 🔑"
          subtitle="Make the most of the home you already own — prepay, refinance, track equity, or weigh selling vs. renting."
        />

        {/* Tool highlights */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 2.5, mt: 3 }}>
          {highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 0.08}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "rgba(148,163,184,0.06)",
                  backdropFilter: "blur(8px)",
                  transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 34px rgba(79,70,229,0.14)", borderColor: "primary.main" },
                }}
              >
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, display: "grid", placeItems: "center", color: "#fff", background: "linear-gradient(135deg,#4F46E5,#9333EA)", mb: 1.5 }}>
                  {h.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 0.5 }}>{h.title}</Typography>
                <Typography variant="body2" color="text.secondary">{h.body}</Typography>
              </Paper>
            </Reveal>
          ))}
        </Box>

        {/* Interactive tools */}
        <Box sx={{ mt: { xs: 4, md: 5 } }}>
          <Reveal>
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
              <OwnerTools />
            </Paper>
          </Reveal>
        </Box>
      </Container>
    </>
  );
}

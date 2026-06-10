import { redirect } from "next/navigation";
import { Container, Typography, Paper, Box, Stack } from "@mui/material";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import OwnerTools from "./OwnerTools";
import { HeroHouse } from "@/components/art/HausArt";
import PhotoBanner from "@/components/PhotoBanner";
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

  return (
    <>
      <DashboardHeader email={user.email ?? ""} role={role} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", mb: 4 }}>
          <Box>
            <Typography variant="h3" sx={{ mb: 1 }}>Your home, optimised 🔑</Typography>
            <Typography color="text.secondary">Homeowner tools to make the most of what you already own.</Typography>
          </Box>
          <Box sx={{ display: { xs: "none", sm: "block" }, width: 150, flexShrink: 0 }}>
            <HeroHouse />
          </Box>
        </Stack>

        <Box sx={{ mb: 4 }}>
          <PhotoBanner
            photo={HOME_GALLERY[1]}
            height={{ xs: 150, md: 190 }}
            title="Make the most of the home you own"
            subtitle="Prepay, refinance, track equity, or weigh selling vs. renting"
            priority
          />
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          <OwnerTools />
        </Paper>
      </Container>
    </>
  );
}

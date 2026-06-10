import { redirect } from "next/navigation";
import { Container, Box, Typography, Paper, Button, Chip, Stack } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import { getMarket, fmtCompact } from "@/lib/markets";
import { EmptyStateArt, FeatureArt } from "@/components/art/HausArt";
import PhotoBanner from "@/components/PhotoBanner";
import { HERO_PHOTO } from "@/lib/photos";

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

  const { data: saved } = await supabase
    .from("assessments")
    .select("id, market_code, status, price_min, price_max, emi, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const items = saved ?? [];

  return (
    <>
      <DashboardHeader email={user.email ?? ""} role={role} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Welcome back 👋</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Your homebuyer dashboard.</Typography>

        <Box sx={{ mb: 4 }}>
          <PhotoBanner
            photo={HERO_PHOTO}
            height={{ xs: 150, md: 190 }}
            title="One step closer to your own front door"
            subtitle="Run the advisor whenever your numbers change"
            priority
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            mb: 4,
            transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 34px rgba(79,70,229,0.14)", borderColor: "primary.main" },
          }}
        >
          <Box sx={{ mb: 1.5 }}><FeatureArt kind="verdict" /></Box>
          <Typography variant="h6" sx={{ mb: 1 }}>Get advice</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Run the advisor to see what you can afford and whether to buy now.
          </Typography>
          <Button href="/" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
            Open the advisor
          </Button>
        </Paper>

        <Typography variant="h5" sx={{ mb: 0.5 }}>Saved advice</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {items.length
            ? `You've saved ${items.length} verdict${items.length > 1 ? "s" : ""}.`
            : "Nothing saved yet."}
        </Typography>

        {items.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px dashed", borderColor: "divider", textAlign: "center" }}>
            <EmptyStateArt />
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Run the advisor and tap <b>“Save this result”</b> to keep it here.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {items.map((a, i) => {
              const m = getMarket(a.market_code);
              const ready = a.status === "ready";
              return (
                <Paper
                  key={a.id}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    animation: "hausFadeUp 420ms ease both",
                    animationDelay: `${i * 60}ms`,
                    transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                    "&:hover": { transform: "translateY(-3px)", boxShadow: "0 12px 30px rgba(79,70,229,0.12)", borderColor: "primary.main" },
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>{m.flag}&nbsp;&nbsp;{m.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Afford {fmtCompact(a.price_min, m)} – {fmtCompact(a.price_max, m)} · EMI {fmtCompact(a.emi, m)}/mo
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(a.created_at).toLocaleDateString(m.locale, { day: "numeric", month: "short", year: "numeric" })}
                      </Typography>
                    </Box>
                    <Chip
                      label={ready ? "Ready to buy" : "Rent for now"}
                      sx={{ fontWeight: 700, color: "#fff", bgcolor: ready ? "#16A34A" : "#D97706", flexShrink: 0 }}
                    />
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Container>
    </>
  );
}

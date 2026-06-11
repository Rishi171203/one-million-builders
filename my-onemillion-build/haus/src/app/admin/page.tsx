import { redirect } from "next/navigation";
import Image from "next/image";
import { Container, Box, Typography, Paper, Chip, Stack } from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import { getMarket, fmtCompact } from "@/lib/markets";
import { EmptyStateArt } from "@/components/art/HausArt";
import DashboardHero from "@/components/DashboardHero";
import StatCard from "@/components/StatCard";
import Reveal from "@/components/Reveal";
import { HOME_GALLERY, unsplashUrl } from "@/lib/photos";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role ?? "buyer";
  if (role !== "admin") redirect("/dashboard");

  // Live stats — admins can read all rows via the is_admin() RLS policy.
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: buyers } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "buyer");
  const { count: owners } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "owner");
  const { count: assessmentCount } = await supabase.from("assessments").select("*", { count: "exact", head: true });

  const { data: recent } = await supabase
    .from("assessments")
    .select("id, market_code, status, price_min, price_max, created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  const recentItems = recent ?? [];

  const stats = [
    { label: "Total users", value: totalUsers ?? 0, sub: "all accounts", icon: <GroupsRoundedIcon /> },
    { label: "Homebuyers", value: buyers ?? 0, sub: "primary audience", icon: <HomeRoundedIcon /> },
    { label: "Homeowners", value: owners ?? 0, sub: "secondary tools", icon: <VpnKeyRoundedIcon /> },
    { label: "Saved assessments", value: assessmentCount ?? 0, sub: "verdicts kept", icon: <InsightsRoundedIcon /> },
  ];

  return (
    <>
      <DashboardHeader email={user.email ?? ""} role={role} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <DashboardHero
          photo={HOME_GALLERY[1]}
          eyebrow="Builder view"
          title="Builder dashboard 🛠️"
          subtitle="Your product at a glance — users, audience split, and the latest activity across haus."
        />

        {/* Live stats */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: 2.5, mt: 3 }}>
          {stats.map((s, i) => (
            <StatCard key={s.label} icon={s.icon} value={s.value} label={s.label} sub={s.sub} delay={i * 0.07} />
          ))}
        </Box>

        {/* Recent activity */}
        <Box sx={{ mt: { xs: 5, md: 7 } }}>
          <Reveal y={16}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>Recent activity</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              The latest saved verdicts across all users.
            </Typography>
          </Reveal>

          {recentItems.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px dashed", borderColor: "divider", textAlign: "center" }}>
              <EmptyStateArt />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No saved assessments yet. They’ll appear here as users save their verdicts.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={1.5}>
              {recentItems.map((a, i) => {
                const m = getMarket(a.market_code);
                const ready = a.status === "ready";
                const thumb = HOME_GALLERY[i % HOME_GALLERY.length];
                return (
                  <Paper
                    key={a.id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      animation: "hausFadeUp 360ms ease both",
                      animationDelay: `${i * 50}ms`,
                      transition: "transform 200ms ease, box-shadow 200ms ease",
                      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 24px rgba(79,70,229,0.12)" },
                    }}
                  >
                    <Stack direction="row" spacing={1.75} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                      <Stack direction="row" spacing={1.75} sx={{ alignItems: "center", minWidth: 0 }}>
                        <Box sx={{ position: "relative", width: 56, height: 56, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                          <Image src={unsplashUrl(thumb.id, 200)} alt={thumb.alt} fill sizes="56px" style={{ objectFit: "cover" }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{m.flag}&nbsp; {m.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fmtCompact(a.price_min, m)} – {fmtCompact(a.price_max, m)} · {new Date(a.created_at).toLocaleDateString(m.locale, { day: "numeric", month: "short" })}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip size="small" label={ready ? "Ready" : "Rent"} sx={{ fontWeight: 700, color: "#fff", bgcolor: ready ? "#16A34A" : "#D97706", flexShrink: 0 }} />
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Box>
      </Container>
    </>
  );
}

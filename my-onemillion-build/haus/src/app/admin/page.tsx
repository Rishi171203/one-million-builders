import { redirect } from "next/navigation";
import { Container, Box, Typography, Paper, Chip, Stack } from "@mui/material";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import { getMarket, fmtCompact } from "@/lib/markets";
import { EmptyStateArt } from "@/components/art/HausArt";

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
    { label: "Total users", value: totalUsers ?? 0 },
    { label: "Homebuyers", value: buyers ?? 0 },
    { label: "Homeowners", value: owners ?? 0 },
    { label: "Saved assessments", value: assessmentCount ?? 0 },
  ];

  return (
    <>
      <DashboardHeader email={user.email ?? ""} role={role} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Builder dashboard 🛠️</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Your product at a glance.</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 2.5, mb: 3 }}>
          {stats.map((s, i) => (
            <Paper
              key={s.label}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                animation: "hausFadeUp 420ms ease both",
                animationDelay: `${i * 70}ms`,
                transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 34px rgba(79,70,229,0.14)", borderColor: "primary.main" },
              }}
            >
              <Typography variant="overline" color="text.secondary">{s.label}</Typography>
              <Typography variant="h3">{s.value}</Typography>
            </Paper>
          ))}
        </Box>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Recent activity</Typography>
          {recentItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <EmptyStateArt />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No saved assessments yet. They’ll appear here as users save their verdicts.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {recentItems.map((a, i) => {
                const m = getMarket(a.market_code);
                const ready = a.status === "ready";
                return (
                  <Stack key={a.id} direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between", py: 1, borderBottom: "1px solid", borderColor: "divider", animation: "hausFadeUp 360ms ease both", animationDelay: `${i * 50}ms` }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.flag}&nbsp; {m.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fmtCompact(a.price_min, m)} – {fmtCompact(a.price_max, m)} · {new Date(a.created_at).toLocaleDateString(m.locale, { day: "numeric", month: "short" })}
                      </Typography>
                    </Box>
                    <Chip size="small" label={ready ? "Ready" : "Rent"} sx={{ fontWeight: 700, color: "#fff", bgcolor: ready ? "#16A34A" : "#D97706" }} />
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Paper>
      </Container>
    </>
  );
}

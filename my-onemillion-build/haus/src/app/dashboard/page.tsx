import { redirect } from "next/navigation";
import Image from "next/image";
import { Container, Box, Typography, Paper, Button, Chip, Stack } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import { getMarket, fmtCompact } from "@/lib/markets";
import { EmptyStateArt } from "@/components/art/HausArt";
import DashboardHero from "@/components/DashboardHero";
import StatCard from "@/components/StatCard";
import Reveal from "@/components/Reveal";
import { HERO_PHOTO, HOME_GALLERY, unsplashUrl } from "@/lib/photos";

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
    .select("id, market_code, status, price_min, price_max, emi, created_at, inputs")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const items = saved ?? [];
  const readyCount = items.filter((a) => a.status === "ready").length;

  return (
    <>
      <DashboardHeader email={user.email ?? ""} role={role} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <DashboardHero
          photo={HERO_PHOTO}
          eyebrow="Homebuyer dashboard"
          title="Welcome back 👋"
          subtitle="One step closer to your own front door — run the advisor whenever your numbers change."
        >
          <Button href="/advisor" variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ bgcolor: "#fff", color: "primary.main", fontWeight: 700, "&:hover": { bgcolor: "rgba(255,255,255,0.9)" } }}>
            Open the advisor
          </Button>
        </DashboardHero>

        {/* Quick stats */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3,1fr)" }, gap: 2.5, mt: 3 }}>
          <StatCard icon={<BookmarkRoundedIcon />} value={items.length} label="Saved verdicts" sub="your history" />
          <StatCard icon={<CheckCircleRoundedIcon />} value={readyCount} label="Ready to buy" sub="of your saved results" delay={0.08} />
          <StatCard icon={<PublicRoundedIcon />} value={5} label="Markets" sub="IN · US · DE · UK · AE" delay={0.16} />
        </Box>

        {/* Saved advice */}
        <Box sx={{ mt: { xs: 5, md: 7 } }}>
          <Reveal y={16}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>Saved advice</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {items.length
                ? `You've saved ${items.length} verdict${items.length > 1 ? "s" : ""}.`
                : "Nothing saved yet."}
            </Typography>
          </Reveal>

          {items.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px dashed", borderColor: "divider", textAlign: "center" }}>
              <EmptyStateArt />
              <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Run the advisor and tap <b>“Save this result”</b> to keep it here.
              </Typography>
              <Button href="/advisor" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
                Open the advisor
              </Button>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {items.map((a, i) => {
                const m = getMarket(a.market_code);
                const ready = a.status === "ready";
                const thumb = HOME_GALLERY[i % HOME_GALLERY.length];
                const inp = a.inputs as { income?: number; savings?: number; rent?: number; age?: number; goal?: string } | null;
                const editHref = inp
                  ? `/advisor?${new URLSearchParams({
                      market: a.market_code,
                      income: String(inp.income ?? ""),
                      savings: String(inp.savings ?? ""),
                      rent: String(inp.rent ?? ""),
                      age: String(inp.age ?? ""),
                      goal: String(inp.goal ?? ""),
                    }).toString()}`
                  : null;
                return (
                  <Paper
                    key={a.id}
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      animation: "hausFadeUp 420ms ease both",
                      animationDelay: `${i * 60}ms`,
                      transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 14px 34px rgba(79,70,229,0.14)", borderColor: "primary.main" },
                    }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }}>
                      <Box sx={{ position: "relative", width: { xs: "100%", sm: 168 }, height: { xs: 120, sm: "auto" }, minHeight: { sm: 150 }, flexShrink: 0 }}>
                        <Image src={unsplashUrl(thumb.id, 500)} alt={thumb.alt} fill sizes="168px" style={{ objectFit: "cover" }} />
                        <Chip
                          label={ready ? "Ready to buy" : "Rent for now"}
                          size="small"
                          sx={{ position: "absolute", top: 10, left: 10, fontWeight: 700, color: "#fff", bgcolor: ready ? "#16A34A" : "#D97706" }}
                        />
                      </Box>
                      <Box sx={{ p: 3, flex: 1 }}>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>{m.flag}&nbsp;&nbsp;{m.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Afford {fmtCompact(a.price_min, m)} – {fmtCompact(a.price_max, m)} · EMI {fmtCompact(a.emi, m)}/mo
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(a.created_at).toLocaleDateString(m.locale, { day: "numeric", month: "short", year: "numeric" })}
                        </Typography>
                        {editHref && (
                          <Box sx={{ mt: 1.5 }}>
                            <Button size="small" variant="text" href={editHref} endIcon={<ArrowForwardRoundedIcon />}>
                              Edit &amp; re-run
                            </Button>
                          </Box>
                        )}
                      </Box>
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

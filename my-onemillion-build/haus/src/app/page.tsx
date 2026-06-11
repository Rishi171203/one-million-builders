"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MARKETS } from "@/lib/markets";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import ThemeToggle from "@/components/ThemeToggle";
import { FeatureArt } from "@/components/art/HausArt";
import RealHomesGallery from "@/components/RealHomesGallery";
import { HERO_PHOTO, unsplashUrl } from "@/lib/photos";

const MotionDiv = motion.div;

export default function Home() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, [supabase]);
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  // The hero call-to-action depends on whether you're signed in.
  // Logged out → start the sign-up flow; logged in → straight into the app.
  function primaryAction() {
    router.push(user ? "/advisor" : "/login");
  }

  return (
    <>
      {/* Top bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: (t) => (t.palette.mode === "light" ? "rgba(255,255,255,0.72)" : "rgba(11,16,32,0.72)"),
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg,#4F46E5,#7C73FF)",
                color: "#fff",
              }}
            >
              <HomeRoundedIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
              haus<Box component="span" sx={{ color: "primary.main" }}>.</Box>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <ThemeToggle />
            {user ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </Typography>
                <Button variant="contained" size="small" onClick={() => router.push("/advisor")}>Open advisor</Button>
                <Button variant="text" size="small" onClick={() => router.push("/dashboard")} sx={{ display: { xs: "none", sm: "inline-flex" } }}>Dashboard</Button>
                <Button variant="outlined" size="small" onClick={logout}>Log out</Button>
              </>
            ) : (
              <>
                <Button variant="text" size="small" onClick={() => router.push("/login?mode=login")}>
                  Log in
                </Button>
                <Button variant="contained" size="small" onClick={() => router.push("/login")}>
                  Register
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Box sx={{ position: "relative", overflow: "hidden", textAlign: "center", px: 2, pt: { xs: 7, md: 11 }, pb: { xs: 5, md: 7 } }}>
        {/* Animated gradient orbs drifting behind the headline */}
        <MotionDiv
          aria-hidden
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: -120, left: "12%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.35), transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }}
        />
        <MotionDiv
          aria-hidden
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: -40, right: "10%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(147,51,234,0.30), transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }}
        />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <Chip
              icon={<PublicRoundedIcon />}
              label="Now in 5 countries"
              sx={{ mb: 3, bgcolor: "rgba(99,102,241,0.12)", color: "primary.main", fontWeight: 600, "& .MuiChip-icon": { color: "primary.main" } }}
            />
            <Typography variant="h1" sx={{ fontSize: { xs: "2.4rem", md: "4rem" }, lineHeight: 1.05, mb: 2.5 }}>
              Buy a home with{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(120deg,#4F46E5,#9333EA)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                confidence
              </Box>
              .
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4, maxWidth: 620, mx: "auto" }}>
              haus is your unbiased, plain-language home-buying advisor. Create a free account to get a
              clear verdict in seconds — what you can afford, whether now is the right time, and your
              results saved to come back to.
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={primaryAction}
              sx={{ py: 1.6, px: 4, fontSize: "1.05rem", boxShadow: "0 12px 28px rgba(79,70,229,0.3)" }}
            >
              {user ? "Open the advisor" : "Get started — it's free"}
            </Button>
            {!user && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Already have an account?{" "}
                <Box
                  component="span"
                  onClick={() => router.push("/login?mode=login")}
                  sx={{ color: "primary.main", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Log in
                </Box>
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ justifyContent: "center", mt: 4, flexWrap: "wrap" }} useFlexGap>
              {MARKETS.map((m) => (
                <Chip key={m.code} label={`${m.flag} ${m.name}`} variant="outlined" size="small" sx={{ fontWeight: 500 }} />
              ))}
            </Stack>
            {/* Real-home hero photo with floating glass verdict + coin badge */}
            <Box sx={{ mt: { xs: 5, md: 7 } }}>
              <MotionDiv
                initial={{ opacity: 0, scale: 0.96, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "relative", width: "100%", maxWidth: 760, margin: "0 auto" }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: { xs: "4 / 3", sm: "16 / 10" },
                    borderRadius: 6,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 24px 60px rgba(79,70,229,0.28)",
                  }}
                >
                  <Image
                    src={unsplashUrl(HERO_PHOTO.id, 1600)}
                    alt={HERO_PHOTO.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 760px"
                    loading="eager"
                    fetchPriority="high"
                    style={{ objectFit: "cover" }}
                  />
                  {/* legibility scrim */}
                  <Box
                    aria-hidden
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(2,6,23,0.55), rgba(2,6,23,0.05) 55%, transparent)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Floating glass verdict card */}
                  <MotionDiv
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: "absolute", left: 16, bottom: 16, zIndex: 2 }}
                  >
                    <MotionDiv animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                      <Paper
                        elevation={0}
                        sx={{
                          px: 2.25,
                          py: 1.75,
                          borderRadius: 3,
                          maxWidth: 250,
                          textAlign: "left",
                          border: "1px solid",
                          borderColor: (t) => (t.palette.mode === "light" ? "rgba(255,255,255,0.6)" : "rgba(148,163,184,0.3)"),
                          bgcolor: (t) => (t.palette.mode === "light" ? "rgba(255,255,255,0.78)" : "rgba(15,23,42,0.72)"),
                          backdropFilter: "blur(14px)",
                          boxShadow: "0 18px 40px rgba(2,6,23,0.28)",
                        }}
                      >
                        <Chip
                          icon={<CheckRoundedIcon />}
                          label="Ready to buy"
                          size="small"
                          sx={{ mb: 1, fontWeight: 700, color: "#fff", bgcolor: "#16A34A", "& .MuiChip-icon": { color: "#fff" } }}
                        />
                        <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", lineHeight: 1.15 }}>
                          You can afford ₹85L – ₹1.05Cr
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          A clear verdict in seconds — sample result
                        </Typography>
                      </Paper>
                    </MotionDiv>
                  </MotionDiv>

                  {/* Floating multi-currency coin badge */}
                  <MotionDiv
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 14 }}
                    style={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}
                  >
                    <MotionDiv animate={{ y: [0, -10, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}>
                      <Box
                        aria-hidden
                        sx={{
                          width: 76,
                          height: 76,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          background: "radial-gradient(circle at 35% 30%, #FDE68A, #D97706)",
                          border: "2px solid #B45309",
                          boxShadow: "0 12px 28px rgba(180,83,9,0.45)",
                          color: "#7C2D12",
                          fontWeight: 800,
                          fontSize: "1.05rem",
                          letterSpacing: "1px",
                        }}
                      >
                        ₹$€
                      </Box>
                    </MotionDiv>
                  </MotionDiv>
                </Box>
              </MotionDiv>
            </Box>
          </MotionDiv>
        </Container>
      </Box>

      {/* Value props */}
      <Container maxWidth="md" sx={{ pb: { xs: 4, md: 6 } }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 2.5 }}>
          {([
            { t: "Clear verdict", d: "Buy now or keep renting — a straight answer, not a sales pitch.", kind: "verdict" },
            { t: "Plain language", d: "Every term explained. No confusing jargon, ever.", kind: "language" },
            { t: "Built for your country", d: "Local currency, interest rates, and down-payment norms.", kind: "country" },
          ] as const).map((v) => (
            <Paper
              key={v.t}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 34px rgba(79,70,229,0.14)", borderColor: "primary.main" },
              }}
            >
              <Box sx={{ mb: 1.5 }}><FeatureArt kind={v.kind} /></Box>
              <Typography variant="h6" sx={{ mb: 0.5 }}>{v.t}</Typography>
              <Typography variant="body2" color="text.secondary">{v.d}</Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* Real homes gallery */}
      <Box><RealHomesGallery /></Box>

      {/* Closing call-to-action */}
      <Container maxWidth="md" sx={{ py: { xs: 7, md: 10 }, textAlign: "center" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 5,
            border: "1px solid",
            borderColor: "divider",
            background: (t) =>
              t.palette.mode === "light"
                ? "linear-gradient(135deg, rgba(79,70,229,0.06), rgba(147,51,234,0.06))"
                : "linear-gradient(135deg, rgba(79,70,229,0.16), rgba(147,51,234,0.12))",
          }}
        >
          <Typography variant="h3" sx={{ mb: 1.5 }}>
            Ready to find your answer?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 520, mx: "auto" }}>
            Create your free haus account and get a clear, personalized verdict — saved to your
            dashboard so you can revisit and refine it anytime.
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={primaryAction}
            sx={{ py: 1.6, px: 4, fontSize: "1.05rem", boxShadow: "0 12px 28px rgba(79,70,229,0.3)" }}
          >
            {user ? "Open the advisor" : "Create your free account"}
          </Button>
        </Paper>
      </Container>
    </>
  );
}

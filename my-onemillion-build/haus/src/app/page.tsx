"use client";

import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
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
  Divider,
} from "@mui/material";
import HausLogo from "@/components/HausLogo";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BookmarkAddedRoundedIcon from "@mui/icons-material/BookmarkAddedRounded";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MARKETS } from "@/lib/markets";
import { createClient } from "@/lib/supabase/client";
import { roleHome } from "@/lib/roles";
import type { User } from "@supabase/supabase-js";
import ThemeToggle from "@/components/ThemeToggle";
import { FeatureArt } from "@/components/art/HausArt";
import Reveal from "@/components/Reveal";
import HomeSlideshow from "@/components/HomeSlideshow";
import { HERO_PHOTO, HOME_GALLERY, INTERIOR_PHOTO, unsplashUrl } from "@/lib/photos";

const MotionDiv = motion.div;

// Count-up number that animates the first time it scrolls into view.
function CountUp({ to, suffix = "", duration = 1.2 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setV(to);
      return;
    }
    const controls = animate(0, to, { duration, ease: "easeOut", onUpdate: (x) => setV(x) });
    return () => controls.stop();
  }, [inView, to, reduce, duration]);
  return (
    <span ref={ref}>
      {Math.round(v)}
      {suffix}
    </span>
  );
}

export default function Home() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Thin gradient scroll-progress bar at the very top of the page.
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, [supabase]);
  // Look up the role so the buttons point to the right home (advisor/tools/admin).
  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setRole(data?.role ?? "buyer"));
  }, [user, supabase]);
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const home = roleHome(role);
  const homeLabel =
    role === "owner" ? "My homeowner tools" : role === "admin" ? "Builder dashboard" : "Open the advisor";

  function primaryAction() {
    router.push(user ? home : "/login");
  }

  const steps = [
    {
      icon: <EditNoteRoundedIcon />,
      title: "Tell us your situation",
      body: "Your income, savings, rent and goal — in your own currency. Takes a minute, with zero jargon.",
      photo: INTERIOR_PHOTO,
    },
    {
      icon: <AutoAwesomeRoundedIcon />,
      title: "Get a clear, AI-personalized verdict",
      body: "haus does the exact math, then writes you a warm, plain-language answer: what you can afford and whether to buy now.",
      photo: HOME_GALLERY[2],
    },
    {
      icon: <BookmarkAddedRoundedIcon />,
      title: "Save, compare, decide with confidence",
      body: "Keep your results, compare buying vs. renting over the years, and revisit anytime from your dashboard.",
      photo: HOME_GALLERY[3],
    },
  ];

  const marquee = [...HOME_GALLERY, ...HOME_GALLERY];

  return (
    <>
      {/* Scroll progress */}
      <MotionDiv
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          transformOrigin: "0%",
          scaleX,
          zIndex: 2000,
          background: "linear-gradient(90deg,#4F46E5,#9333EA)",
        }}
      />

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
            <HausLogo size={34} />
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
                <Button variant="contained" size="small" onClick={() => router.push(home)}>{homeLabel}</Button>
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
          animate={reduce ? {} : { x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: -120, left: "12%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.35), transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }}
        />
        <MotionDiv
          aria-hidden
          animate={reduce ? {} : { x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: -40, right: "10%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(147,51,234,0.30), transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }}
        />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
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
              {user ? homeLabel : "Get started — it's free"}
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
            {/* Real-home hero photo (slow Ken Burns) with floating glass verdict + coin badge */}
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
                  <MotionDiv
                    aria-hidden
                    animate={reduce ? {} : { scale: [1, 1.08] }}
                    transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    style={{ position: "absolute", inset: 0 }}
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
                  </MotionDiv>
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
                    <MotionDiv animate={reduce ? {} : { y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
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
                    <MotionDiv animate={reduce ? {} : { y: [0, -10, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}>
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

      {/* Trust stats strip (faint image behind glass) */}
      <Container maxWidth="lg" sx={{ pb: { xs: 5, md: 7 } }}>
        <Reveal>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 5,
              border: "1px solid",
              borderColor: "divider",
              p: { xs: 3, md: 4 },
            }}
          >
            <Box aria-hidden sx={{ position: "absolute", inset: 0, opacity: 0.1 }}>
              <Image src={unsplashUrl(HOME_GALLERY[1].id, 1400)} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
            </Box>
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                inset: 0,
                background: (t) =>
                  t.palette.mode === "light"
                    ? "linear-gradient(135deg, rgba(79,70,229,0.05), rgba(147,51,234,0.05))"
                    : "linear-gradient(135deg, rgba(79,70,229,0.16), rgba(147,51,234,0.12))",
              }}
            />
            <Box sx={{ position: "relative", display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: { xs: 3, md: 2 }, textAlign: "center" }}>
              {[
                { big: <CountUp to={5} />, label: "Countries", sub: "IN · US · DE · UK · AE" },
                { big: <CountUp to={100} suffix="%" />, label: "Free to use", sub: "No card, ever" },
                { big: <CountUp to={8} />, label: "Buyer tools", sub: "advisor, rent-vs-buy & more" },
                { big: "₹ $ €", label: "Your currency", sub: "local rates & norms" },
              ].map((s, idx) => (
                <Box key={idx}>
                  <Typography variant="h3" sx={{ fontWeight: 800, background: "linear-gradient(120deg,#4F46E5,#9333EA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {s.big}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, mt: 0.5 }}>{s.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.sub}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Reveal>
      </Container>

      {/* How haus works — storytelling rows with imagery */}
      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 8 } }}>
        <Reveal>
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }}>How it works</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>A clear answer in three steps</Typography>
          </Box>
        </Reveal>
        <Stack spacing={{ xs: 5, md: 8 }}>
          {steps.map((s, idx) => (
            <Reveal key={s.title} delay={0.05}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: { xs: 3, md: 6 },
                  alignItems: "center",
                  direction: { md: idx % 2 === 1 ? "rtl" : "ltr" },
                }}
              >
                <Box sx={{ direction: "ltr" }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2.5, flexShrink: 0, display: "grid", placeItems: "center", color: "#fff", background: "linear-gradient(135deg,#4F46E5,#9333EA)" }}>
                      {s.icon}
                    </Box>
                    <Chip label={`Step ${idx + 1}`} size="small" sx={{ fontWeight: 700, bgcolor: "rgba(99,102,241,0.12)", color: "primary.main" }} />
                  </Stack>
                  <Typography variant="h4" sx={{ mb: 1 }}>{s.title}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: "1.05rem", lineHeight: 1.65 }}>{s.body}</Typography>
                </Box>
                <Box sx={{ direction: "ltr", position: "relative", width: "100%", aspectRatio: "16 / 11", borderRadius: 5, overflow: "hidden", border: "1px solid", borderColor: "divider", boxShadow: "0 20px 50px rgba(2,6,23,0.18)" }}>
                  <Image src={unsplashUrl(s.photo.id, 1200)} alt={s.photo.alt} fill sizes="(max-width: 900px) 100vw, 560px" style={{ objectFit: "cover" }} />
                </Box>
              </Box>
            </Reveal>
          ))}
        </Stack>
      </Container>

      {/* Motion slideshow of real homes */}
      <Container maxWidth="lg" sx={{ pb: { xs: 5, md: 8 } }}>
        <Reveal>
          <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }}>Built for real homes</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>Homes like the one you want</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560, mx: "auto" }}>
              From Bengaluru to Berlin — haus speaks your market&apos;s currency, rates, and norms.
            </Typography>
          </Box>
        </Reveal>
        <Reveal>
          <HomeSlideshow />
        </Reveal>
      </Container>

      {/* Why haus — value props */}
      <Container maxWidth="md" sx={{ pb: { xs: 5, md: 8 } }}>
        <Reveal>
          <Box sx={{ textAlign: "center", mb: { xs: 3, md: 5 } }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }}>Why haus</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>Honest by design</Typography>
          </Box>
        </Reveal>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 2.5 }}>
          {([
            { t: "Clear verdict", d: "Buy now or keep renting — a straight answer, not a sales pitch.", kind: "verdict" },
            { t: "Plain language", d: "Every term explained. No confusing jargon, ever.", kind: "language" },
            { t: "Built for your country", d: "Local currency, interest rates, and down-payment norms.", kind: "country" },
          ] as const).map((v, idx) => (
            <Reveal key={v.t} delay={idx * 0.08}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: (t) => (t.palette.mode === "light" ? "rgba(255,255,255,0.6)" : "rgba(148,163,184,0.06)"),
                  backdropFilter: "blur(8px)",
                  transition: "transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease",
                  "&:hover": { transform: "translateY(-6px)", boxShadow: "0 18px 40px rgba(79,70,229,0.16)", borderColor: "primary.main" },
                }}
              >
                <Box sx={{ mb: 1.5 }}><FeatureArt kind={v.kind} /></Box>
                <Typography variant="h6" sx={{ mb: 0.5 }}>{v.t}</Typography>
                <Typography variant="body2" color="text.secondary">{v.d}</Typography>
              </Paper>
            </Reveal>
          ))}
        </Box>
      </Container>

      {/* Markets marquee — alive imagery band */}
      <Box sx={{ position: "relative", overflow: "hidden", py: { xs: 3, md: 4 }, borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block", textAlign: "center", letterSpacing: 2, mb: 2 }}>
          Now helping buyers across five markets
        </Typography>
        <MotionDiv
          animate={reduce ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ display: "flex", gap: 16, width: "max-content", paddingInline: 8 }}
        >
          {marquee.map((p, idx) => (
            <Box key={idx} sx={{ position: "relative", width: { xs: 220, md: 300 }, aspectRatio: "3 / 2", borderRadius: 4, overflow: "hidden", flexShrink: 0, border: "1px solid", borderColor: "divider" }}>
              <Image src={unsplashUrl(p.id, 700)} alt={p.alt} fill sizes="300px" style={{ objectFit: "cover" }} />
              <Box aria-hidden sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(2,6,23,0.62), transparent 60%)" }} />
              <Typography sx={{ position: "absolute", left: 12, bottom: 10, color: "#fff", fontWeight: 700, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                {p.flag}&nbsp;{p.city}
              </Typography>
            </Box>
          ))}
        </MotionDiv>
      </Box>

      {/* Homeowner entry — buyers are the hero; this is the secondary path. */}
      {!user && (
        <Container maxWidth="md" sx={{ pt: { xs: 5, md: 8 } }}>
          <Reveal>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 0, md: 0 },
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid",
                borderColor: (t) => (t.palette.mode === "light" ? "rgba(217,119,6,0.25)" : "rgba(217,119,6,0.4)"),
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" },
              }}
            >
              <Box sx={{ position: "relative", minHeight: { xs: 140, sm: "100%" } }}>
                <Image src={unsplashUrl(INTERIOR_PHOTO.id, 700)} alt={INTERIOR_PHOTO.alt} fill sizes="180px" style={{ objectFit: "cover" }} />
                <Box aria-hidden sx={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(217,119,6,0.25), rgba(180,83,9,0.1))" }} />
              </Box>
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { md: "center" },
                  gap: 2.5,
                  background: (t) =>
                    t.palette.mode === "light"
                      ? "linear-gradient(135deg, rgba(253,230,138,0.3), rgba(217,119,6,0.05))"
                      : "linear-gradient(135deg, rgba(217,119,6,0.16), rgba(180,83,9,0.06))",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>🔑 Already own a home?</Typography>
                  <Typography variant="body2" color="text.secondary">
                    haus isn&apos;t only for buyers. Sign up as a homeowner for free tools to{" "}
                    prepay &amp; refinance smartly, track your equity, and weigh selling vs. renting out — all in your currency.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={() => router.push("/login?role=owner")}
                  sx={{ flexShrink: 0, borderColor: "#B45309", color: "#B45309", "&:hover": { borderColor: "#92400E", bgcolor: "rgba(217,119,6,0.08)" } }}
                >
                  Explore homeowner tools
                </Button>
              </Box>
            </Paper>
          </Reveal>
        </Container>
      )}

      {/* Closing call-to-action — photo + glass overlay */}
      <Container maxWidth="md" sx={{ py: { xs: 7, md: 10 } }}>
        <Reveal>
          <Box sx={{ position: "relative", overflow: "hidden", borderRadius: 6, border: "1px solid", borderColor: "divider", boxShadow: "0 30px 70px rgba(2,6,23,0.25)" }}>
            <Box aria-hidden sx={{ position: "absolute", inset: 0 }}>
              <Image src={unsplashUrl(HOME_GALLERY[4].id, 1600)} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
            </Box>
            <Box aria-hidden sx={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(49,46,129,0.86), rgba(76,29,149,0.82))", backdropFilter: "blur(2px)" }} />
            <Box sx={{ position: "relative", textAlign: "center", color: "#fff", p: { xs: 4, md: 8 } }}>
              <Typography variant="h3" sx={{ mb: 1.5, color: "#fff" }}>
                Ready to find your answer?
              </Typography>
              <Typography sx={{ mb: 4, maxWidth: 520, mx: "auto", color: "rgba(255,255,255,0.88)" }}>
                Create your free haus account and get a clear, personalized verdict — saved to your
                dashboard so you can revisit and refine it anytime.
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={primaryAction}
                sx={{ py: 1.6, px: 4, fontSize: "1.05rem", bgcolor: "#fff", color: "primary.main", "&:hover": { bgcolor: "rgba(255,255,255,0.9)" }, boxShadow: "0 12px 28px rgba(2,6,23,0.3)" }}
              >
                {user ? homeLabel : "Create your free account"}
              </Button>
            </Box>
          </Box>
        </Reveal>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 }, bgcolor: (t) => (t.palette.mode === "light" ? "rgba(248,250,252,0.6)" : "rgba(11,16,32,0.4)") }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                <HausLogo size={30} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  haus<Box component="span" sx={{ color: "primary.main" }}>.</Box>
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
                Unbiased, plain-language home-finance advice — free, in your currency.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
              {MARKETS.map((m) => (
                <Chip key={m.code} label={`${m.flag} ${m.name}`} variant="outlined" size="small" />
              ))}
            </Stack>
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" color="text.secondary">
              © 2026 haus · Guidance, not financial advice.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }} onClick={() => router.push("/login?mode=login")}>Log in</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }} onClick={() => router.push("/login")}>Register</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

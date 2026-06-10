"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Chip,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import BookmarkAddRoundedIcon from "@mui/icons-material/BookmarkAddRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { computeResult, type Result } from "@/lib/haus";
import { MARKETS, getMarket, DEFAULT_MARKET, fmtCompact, fmtFull, type Market } from "@/lib/markets";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import ThemeToggle from "@/components/ThemeToggle";
import { FeatureArt } from "@/components/art/HausArt";
import RealHomesGallery from "@/components/RealHomesGallery";
import TypeOut from "@/components/TypeOut";
import RentVsBuy from "@/components/RentVsBuy";
import { HERO_PHOTO, unsplashUrl } from "@/lib/photos";

const MotionDiv = motion.div;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, { duration: 1, ease: "easeOut", onUpdate: (v) => setD(v) });
    return () => controls.stop();
  }, [value]);
  return <>{format(d)}</>;
}

const toNum = (s: string) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;

export default function Home() {
  const [market, setMarket] = useState<Market>(DEFAULT_MARKET);
  const [income, setIncome] = useState(String(DEFAULT_MARKET.sample.income));
  const [savings, setSavings] = useState(String(DEFAULT_MARKET.sample.savings));
  const [rent, setRent] = useState(String(DEFAULT_MARKET.sample.rent));
  const [age, setAge] = useState(String(DEFAULT_MARKET.sample.age));
  const [goal, setGoal] = useState("Should I buy a home now or keep renting for a couple more years?");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [openTerm, setOpenTerm] = useState<number | null>(null);
  const [snack, setSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState("Glad it helped 💙");
  const [snackSeverity, setSnackSeverity] = useState<"success" | "error">("success");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  const advisorRef = useRef<HTMLDivElement>(null);

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

  function changeMarket(code: string) {
    const m = getMarket(code);
    setMarket(m);
    setIncome(String(m.sample.income));
    setSavings(String(m.sample.savings));
    setRent(String(m.sample.rent));
    setAge(String(m.sample.age));
    setResult(null);
    setErrors({});
  }

  function validate() {
    const e: Record<string, string> = {};
    if (toNum(income) <= 0) e.income = "Enter your monthly income.";
    if (toNum(savings) < 0) e.savings = "Enter an amount (0 if none).";
    if (toNum(rent) < 0) e.rent = "Enter an amount (0 if none).";
    const a = toNum(age);
    if (a < 18 || a > 70) e.age = "Enter an age between 18 and 70.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    setOpenTerm(null);
    setSaved(false);
    setAiPowered(false);

    // Math is deterministic and instant — it's our source of truth + fallback.
    const inputs = { income: toNum(income), savings: toNum(savings), rent: toNum(rent), age: toNum(age), goal };
    const r = computeResult(inputs, market);

    // Ask the server (Gemini) to write a warm, personalized verdict + steps.
    // If it's unavailable, we silently keep the deterministic text.
    try {
      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketCode: market.code, inputs }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data?.verdict === "string" && data.verdict.trim()) r.verdict = data.verdict;
        if (Array.isArray(data?.nextSteps) && data.nextSteps.length) r.nextSteps = data.nextSteps;
        setAiPowered(data?.source === "ai");
      }
    } catch {
      // Network hiccup → keep the deterministic verdict. haus never breaks.
    }

    setResult(r);
    setLoading(false);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function showSnack(msg: string, severity: "success" | "error" = "success") {
    setSnackMsg(msg);
    setSnackSeverity(severity);
    setSnack(true);
  }

  async function saveResult() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!result) return;
    setSaving(true);
    const { error } = await supabase.from("assessments").insert({
      user_id: user.id,
      market_code: market.code,
      inputs: { income: toNum(income), savings: toNum(savings), rent: toNum(rent), age: toNum(age), goal },
      status: result.status,
      price_min: Math.round(result.priceMin),
      price_max: Math.round(result.priceMax),
      emi: Math.round(result.emi),
      verdict: result.verdict,
    });
    setSaving(false);
    if (error) {
      showSnack("Couldn't save — " + error.message, "error");
    } else {
      setSaved(true);
      showSnack("Saved to your dashboard ✅");
    }
  }

  const ready = result?.status === "ready";
  const accent = ready ? "#16A34A" : "#D97706";
  const cur = market.currencySymbol;

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
                <Button variant="contained" size="small" onClick={() => router.push("/dashboard")}>Dashboard</Button>
                <Button variant="outlined" size="small" onClick={logout}>Log out</Button>
              </>
            ) : (
              <Button variant="contained" size="small" onClick={() => router.push("/login")}>
                Log in
              </Button>
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
              haus is your unbiased, plain-language home-buying advisor. Tell us your situation and get a
              clear verdict in seconds — what you can afford, and whether now is the right time.
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => advisorRef.current?.scrollIntoView({ behavior: "smooth" })}
              sx={{ py: 1.6, px: 4, fontSize: "1.05rem", boxShadow: "0 12px 28px rgba(79,70,229,0.3)" }}
            >
              Get my free verdict
            </Button>
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
      <RealHomesGallery />

      {/* Advisor */}
      <Container maxWidth="md" sx={{ pb: 12 }}>
        <Box ref={advisorRef} sx={{ scrollMarginTop: 80, pt: 4 }}>
          <MotionDiv initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 1 }}>
                <Box>
                  <Typography variant="h4">Should you buy a home yet?</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Fill this in for a clear, jargon-free verdict.
                  </Typography>
                </Box>
                <TextField
                  select
                  label="Country"
                  value={market.code}
                  onChange={(e) => changeMarket(e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  {MARKETS.map((m) => (
                    <MenuItem key={m.code} value={m.code}>
                      {m.flag}&nbsp;&nbsp;{m.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack spacing={2.5} sx={{ mt: 2 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                  <TextField
                    label="Monthly income"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    error={!!errors.income}
                    helperText={errors.income || "Your take-home pay per month"}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">{cur}</InputAdornment> } }}
                    fullWidth
                  />
                  <TextField
                    label="Current savings"
                    value={savings}
                    onChange={(e) => setSavings(e.target.value)}
                    error={!!errors.savings}
                    helperText={errors.savings || "What you've set aside today"}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">{cur}</InputAdornment> } }}
                    fullWidth
                  />
                  <TextField
                    label="Current rent"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    error={!!errors.rent}
                    helperText={errors.rent || "Monthly rent now (0 if none)"}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">{cur}</InputAdornment> } }}
                    fullWidth
                  />
                  <TextField
                    label="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    error={!!errors.age}
                    helperText={errors.age || "Used to estimate loan tenure"}
                    fullWidth
                  />
                </Box>
                <TextField
                  label="Your goal or question"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={onSubmit}
                  disabled={loading}
                  endIcon={!loading && <ArrowForwardRoundedIcon />}
                  sx={{ py: 1.5, fontSize: "1rem", boxShadow: "0 8px 20px rgba(79,70,229,0.25)" }}
                >
                  {loading ? (
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Writing your advice…</span>
                    </Stack>
                  ) : (
                    "Get my verdict"
                  )}
                </Button>
                <Typography variant="caption" color="text.secondary" align="center">
                  Guidance, not financial advice.
                </Typography>
              </Stack>
            </Paper>
          </MotionDiv>
        </Box>

        {/* Result */}
        <Box ref={resultRef} sx={{ scrollMarginTop: 80 }}>
          <AnimatePresence>
            {result && (
              <MotionDiv variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <MotionDiv variants={item}>
                  <Paper elevation={0} sx={{ mt: 4, p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider", position: "relative", overflow: "hidden" }}>
                    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: accent }} />
                    <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2, flexWrap: "wrap" }} useFlexGap>
                      <Chip label={result.chipLabel} sx={{ fontWeight: 700, color: "#fff", bgcolor: accent }} />
                      {aiPowered && (
                        <Chip
                          icon={<AutoAwesomeRoundedIcon />}
                          label="Personalized by AI"
                          sx={{ fontWeight: 700, bgcolor: "rgba(99,102,241,0.12)", color: "primary.main", "& .MuiChip-icon": { color: "primary.main" } }}
                        />
                      )}
                    </Stack>
                    <Typography variant="h4" sx={{ mb: 1.5 }}>
                      {ready ? "You're in a strong position to buy." : "Renting is the smarter move — for now."}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: "1.05rem", lineHeight: 1.6 }}>
                      <TypeOut text={result.verdict} />
                    </Typography>
                  </Paper>
                </MotionDiv>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mt: 2.5 }}>
                  <MotionDiv variants={item}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider", height: "100%", transition: "transform 220ms ease, box-shadow 220ms ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 34px rgba(79,70,229,0.14)" } }}>
                      <Typography variant="overline" color="text.secondary">You can afford</Typography>
                      <Typography variant="h3" sx={{ my: 0.5 }}>
                        <AnimatedNumber value={result.priceMin} format={(n) => fmtCompact(n, market)} />
                        {" – "}
                        <AnimatedNumber value={result.priceMax} format={(n) => fmtCompact(n, market)} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Based on your income, savings, and a safe EMI limit.
                      </Typography>
                    </Paper>
                  </MotionDiv>
                  <MotionDiv variants={item}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider", height: "100%", transition: "transform 220ms ease, box-shadow 220ms ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 34px rgba(79,70,229,0.14)" } }}>
                      <Typography variant="overline" color="text.secondary">Estimated EMI</Typography>
                      <Typography variant="h3" sx={{ my: 0.5 }}>
                        <AnimatedNumber value={result.emi} format={(n) => fmtFull(n, market)} />
                        <Box component="span" sx={{ fontSize: "1rem", fontWeight: 600, color: "text.secondary" }}>/mo</Box>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        At {result.assumptions.interestPct}% over {result.tenureYears} years.
                      </Typography>
                    </Paper>
                  </MotionDiv>
                </Box>

                <MotionDiv variants={item}>
                  <Paper elevation={0} sx={{ mt: 2.5, p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Jargon, explained</Typography>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                      {result.terms.map((t, i) => (
                        <Chip
                          key={t.term}
                          label={t.term}
                          onClick={() => setOpenTerm(openTerm === i ? null : i)}
                          variant={openTerm === i ? "filled" : "outlined"}
                          color={openTerm === i ? "primary" : "default"}
                          sx={{ fontWeight: 600, cursor: "pointer" }}
                        />
                      ))}
                    </Stack>
                    <AnimatePresence mode="wait">
                      {openTerm !== null && (
                        <MotionDiv key={openTerm} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                          <Box sx={{ mt: 2, p: 2, bgcolor: (t) => (t.palette.mode === "light" ? "#F1F5F9" : "rgba(148,163,184,0.10)"), borderRadius: 2, borderLeft: "3px solid", borderColor: "primary.main" }}>
                            <Typography variant="body2">
                              <b>{result.terms[openTerm].term}:</b> {result.terms[openTerm].explanation}
                            </Typography>
                          </Box>
                        </MotionDiv>
                      )}
                    </AnimatePresence>
                    {openTerm === null && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Tap a term to see it explained in plain language.
                      </Typography>
                    )}
                  </Paper>
                </MotionDiv>

                <MotionDiv variants={item}>
                  <Paper elevation={0} sx={{ mt: 2.5, p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Your next steps</Typography>
                    <Stack spacing={2}>
                      {result.nextSteps.map((s, i) => (
                        <Stack key={i} direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                          <Box sx={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", bgcolor: "rgba(99,102,241,0.15)", color: "primary.main", display: "grid", placeItems: "center", fontWeight: 700, fontSize: "0.85rem" }}>
                            {i + 1}
                          </Box>
                          <Typography sx={{ pt: 0.3 }}>{s}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </MotionDiv>

                <MotionDiv variants={item}>
                  <RentVsBuy price={result.priceMax} monthlyRent={toNum(rent)} tenureYears={result.tenureYears} market={market} />
                </MotionDiv>

                <MotionDiv variants={item}>
                  <Box sx={{ mt: 2.5, p: 2.5, bgcolor: (t) => (t.palette.mode === "light" ? "#F1F5F9" : "rgba(148,163,184,0.10)"), borderRadius: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      <b>Assumptions ({market.name}):</b> {result.assumptions.interestPct}% annual interest ·{" "}
                      {result.tenureYears}-year tenure · {result.assumptions.downPaymentPct}% down payment ·
                      EMI capped at {result.assumptions.emiCapPct}% of income. haus gives educational guidance,
                      not financial advice.
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2.5 }}>
                    <Button variant="contained" color="success" startIcon={<FavoriteRoundedIcon />} onClick={() => showSnack("Glad it helped 💙")}>
                      This helped me
                    </Button>
                    {user ? (
                      <Button
                        variant="outlined"
                        disabled={saving || saved}
                        startIcon={saved ? <CheckRoundedIcon /> : <BookmarkAddRoundedIcon />}
                        onClick={saveResult}
                      >
                        {saved ? "Saved" : saving ? "Saving…" : "Save this result"}
                      </Button>
                    ) : (
                      <Button variant="outlined" startIcon={<BookmarkAddRoundedIcon />} onClick={() => router.push("/login")}>
                        Log in to save
                      </Button>
                    )}
                    <Button variant="text" onClick={() => advisorRef.current?.scrollIntoView({ behavior: "smooth" })}>
                      Edit my details
                    </Button>
                  </Stack>
                </MotionDiv>
              </MotionDiv>
            )}
          </AnimatePresence>
        </Box>
      </Container>

      <Snackbar open={snack} autoHideDuration={2600} onClose={() => setSnack(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackSeverity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </>
  );
}

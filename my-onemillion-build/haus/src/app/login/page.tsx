"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { roleHome } from "@/lib/roles";
import ThemeToggle from "@/components/ThemeToggle";
import HausLogo from "@/components/HausLogo";
import Reveal from "@/components/Reveal";
import { HOME_GALLERY, unsplashUrl } from "@/lib/photos";
import { MARKETS } from "@/lib/markets";

const MotionDiv = motion.div;

export default function LoginPage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const reduce = useReducedMotion();
  const [tab, setTab] = useState(1); // 0 = login, 1 = register (register-first)
  const [role, setRole] = useState<"buyer" | "owner">("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  // An explicit destination (e.g. a deep link). Empty = decide by the user's role.
  const [next, setNext] = useState("");

  // Read ?mode=, ?next= and ?role= from the URL on mount (window.location avoids
  // the useSearchParams Suspense rule). mode=login opens the Log in tab;
  // role=owner opens Register pre-set to Homeowner.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("mode") === "login") setTab(0);
    const n = sp.get("next");
    if (n && n.startsWith("/")) setNext(n);
    if (sp.get("role") === "owner") {
      setRole("owner");
      setTab(1);
    }
  }, []);

  // Look up the signed-in user's role, then send them to their home screen
  // (buyer → advisor, homeowner → tools, admin → dashboard).
  async function goToRoleHome() {
    const { data: { user } } = await supabase.auth.getUser();
    let role: string | null = null;
    if (user) {
      const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      role = p?.role ?? "buyer";
    }
    router.push(roleHome(role));
  }

  async function handleEmail() {
    setError(null);
    setInfo(null);
    if (!email || password.length < 6) {
      setError("Enter an email and a password of at least 6 characters.");
      return;
    }
    setLoading(true);

    if (tab === 0) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError(error.message);
      else if (next) router.push(next);
      else await goToRoleHome();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) {
        if (/already|registered|exists/i.test(error.message)) {
          setError("You already have an account — please log in.");
          setTab(0);
        } else setError(error.message);
      } else if (data.session) {
        // Email confirmation disabled → already logged in. Land on the home
        // screen for the type they just registered as.
        router.push(next || roleHome(role));
      } else {
        setInfo("Account created! Check your email to confirm, then log in.");
        setTab(0);
      }
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}` },
    });
    if (error) setError(error.message);
  }

  const trust = [
    "Free forever — no card required",
    "AI-personalized, plain-language verdicts",
    "Built for your country & currency",
  ];

  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" } }}>
      <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 20 }}>
        <ThemeToggle />
      </Box>

      {/* Left — cinematic brand panel (hidden on small screens) */}
      <Box sx={{ position: "relative", display: { xs: "none", md: "block" }, overflow: "hidden" }}>
        <MotionDiv
          aria-hidden
          animate={reduce ? {} : { scale: [1, 1.08] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Image src={unsplashUrl(HOME_GALLERY[2].id, 1400)} alt={HOME_GALLERY[2].alt} fill sizes="55vw" loading="eager" fetchPriority="high" style={{ objectFit: "cover" }} />
        </MotionDiv>
        <Box aria-hidden sx={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(49,46,129,0.9), rgba(76,29,149,0.82))" }} />
        <Box sx={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", p: { md: 5, lg: 7 }, color: "#fff" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "#fff" }}>
            <HausLogo size={42} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff" }}>haus.</Typography>
          </Link>

          <MotionDiv
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Typography variant="h2" sx={{ fontSize: { md: "2.6rem", lg: "3.2rem" }, lineHeight: 1.1, mb: 2.5, color: "#fff" }}>
              Your home journey starts here.
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 4 }}>
              {trust.map((t) => (
                <Stack key={t} direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                  <CheckCircleRoundedIcon sx={{ color: "#A5B4FC" }} />
                  <Typography sx={{ color: "rgba(255,255,255,0.92)", fontWeight: 500 }}>{t}</Typography>
                </Stack>
              ))}
            </Stack>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
              {MARKETS.map((m) => (
                <Chip key={m.code} label={`${m.flag} ${m.name}`} size="small" sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)" }} />
              ))}
            </Stack>
          </MotionDiv>
        </Box>
      </Box>

      {/* Right — the form */}
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", p: { xs: 3, sm: 5 }, py: { xs: 6, md: 5 } }}>
        <Box sx={{ width: "100%", maxWidth: 440, mx: "auto" }}>
          {/* Logo (mobile, since the brand panel is hidden) */}
          <Box sx={{ textAlign: "center", mb: 3, display: { md: "none" } }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <HausLogo size={38} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
                haus<Box component="span" sx={{ color: "primary.main" }}>.</Box>
              </Typography>
            </Link>
          </Box>

          <Reveal y={20}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: (t) => (t.palette.mode === "light" ? "rgba(255,255,255,0.7)" : "rgba(148,163,184,0.06)"),
                backdropFilter: "blur(10px)",
                boxShadow: "0 24px 60px rgba(2,6,23,0.12)",
              }}
            >
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                {tab === 0 ? "Welcome back" : "Create your haus account"}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {tab === 0 ? "Log in to pick up where you left off." : "Tell us who you are to get the right tools."}
              </Typography>

              <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(null); setInfo(null); }} sx={{ mb: 3 }}>
                <Tab label="Log in" sx={{ textTransform: "none", fontWeight: 600 }} />
                <Tab label="Register" sx={{ textTransform: "none", fontWeight: 600 }} />
              </Tabs>

              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                {info && <Alert severity="success">{info}</Alert>}

                {tab === 1 && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>I am a…</Typography>
                    <ToggleButtonGroup
                      exclusive
                      value={role}
                      onChange={(_, v) => v && setRole(v)}
                      color="primary"
                      fullWidth
                    >
                      <ToggleButton value="buyer" sx={{ py: 1.2, fontWeight: 600 }}>🏠&nbsp; Homebuyer</ToggleButton>
                      <ToggleButton value="owner" sx={{ py: 1.2, fontWeight: 600 }}>🔑&nbsp; Homeowner</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}

                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth autoComplete="email" />
                <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth autoComplete={tab === 0 ? "current-password" : "new-password"} helperText="At least 6 characters" />
                <Button variant="contained" size="large" onClick={handleEmail} disabled={loading} sx={{ py: 1.4, boxShadow: "0 8px 20px rgba(79,70,229,0.25)" }}>
                  {loading ? <CircularProgress size={22} color="inherit" /> : tab === 0 ? "Log in" : "Create account"}
                </Button>

                <Divider>or</Divider>

                <Button variant="outlined" size="large" startIcon={<GoogleIcon />} onClick={handleGoogle} sx={{ py: 1.4 }}>
                  Continue with Google
                </Button>
              </Stack>
            </Paper>
          </Reveal>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            <Link href="/" style={{ color: "inherit" }}>← Back to haus</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

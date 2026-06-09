"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Container,
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
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import GoogleIcon from "@mui/icons-material/Google";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [tab, setTab] = useState(1); // 0 = login, 1 = register (register-first)
  const [role, setRole] = useState<"buyer" | "owner">("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

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
      else router.push("/dashboard");
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
        router.push("/dashboard"); // email confirmation disabled → logged in
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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", py: 6 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: 2, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#4F46E5,#7C73FF)", color: "#fff" }}>
            <HomeRoundedIcon fontSize="small" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
            haus<Box component="span" sx={{ color: "primary.main" }}>.</Box>
          </Typography>
        </Link>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          {tab === 0 ? "Welcome back" : "Create your haus account"}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {tab === 0 ? "Log in to your dashboard." : "Tell us who you are to get the right tools."}
        </Typography>

        <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(null); setInfo(null); }} sx={{ mb: 3 }}>
          <Tab label="Log in" />
          <Tab label="Register" />
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
          <Button variant="contained" size="large" onClick={handleEmail} disabled={loading} sx={{ py: 1.4 }}>
            {loading ? <CircularProgress size={22} color="inherit" /> : tab === 0 ? "Log in" : "Create account"}
          </Button>

          <Divider>or</Divider>

          <Button variant="outlined" size="large" startIcon={<GoogleIcon />} onClick={handleGoogle} sx={{ py: 1.4 }}>
            Continue with Google
          </Button>
        </Stack>
      </Paper>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
        <Link href="/" style={{ color: "inherit" }}>← Back to haus</Link>
      </Typography>
    </Container>
  );
}

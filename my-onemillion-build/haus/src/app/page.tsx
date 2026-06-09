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
import { computeResult, inrCompact, inrFull, type Result } from "@/lib/haus";

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
  const [income, setIncome] = useState("90000");
  const [savings, setSavings] = useState("700000");
  const [rent, setRent] = useState("28000");
  const [age, setAge] = useState("27");
  const [goal, setGoal] = useState("Should I buy a flat now or keep renting for a couple more years?");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [openTerm, setOpenTerm] = useState<number | null>(null);
  const [snack, setSnack] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (toNum(income) <= 0) e.income = "Enter your monthly income in ₹.";
    if (toNum(savings) < 0) e.savings = "Enter an amount in ₹ (0 if none).";
    if (toNum(rent) < 0) e.rent = "Enter an amount in ₹ (0 if none).";
    const a = toNum(age);
    if (a < 18 || a > 70) e.age = "Enter an age between 18 and 70.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit() {
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    setOpenTerm(null);
    window.setTimeout(() => {
      const r = computeResult({
        income: toNum(income),
        savings: toNum(savings),
        rent: toNum(rent),
        age: toNum(age),
        goal,
      });
      setResult(r);
      setLoading(false);
      window.setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        80
      );
    }, 900);
  }

  const ready = result?.status === "ready";
  const accent = ready ? "#16A34A" : "#D97706";

  return (
    <>
      {/* Top bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.72)",
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
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
            Plain-language home-buying advice
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 }, pb: 12 }}>
        {/* Hero */}
        <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <Chip
            icon={<AutoAwesomeRoundedIcon />}
            label="Made for Bangalore first-time buyers"
            sx={{ mb: 2, bgcolor: "primary.light", color: "primary.dark", fontWeight: 600 }}
          />
          <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "3rem" }, mb: 1.5, lineHeight: 1.1 }}>
            Should you buy a home yet?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4, maxWidth: 560 }}>
            Tell us your situation. haus gives you a clear, jargon-free verdict — what you can afford,
            and whether now is the right time.
          </Typography>
        </MotionDiv>

        {/* Form */}
        <MotionDiv
          ref={formRef}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
            <Stack spacing={2.5}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                <TextField
                  label="Monthly income"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  error={!!errors.income}
                  helperText={errors.income || "Your take-home pay per month"}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                  fullWidth
                />
                <TextField
                  label="Current savings"
                  value={savings}
                  onChange={(e) => setSavings(e.target.value)}
                  error={!!errors.savings}
                  helperText={errors.savings || "What you've set aside today"}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                  fullWidth
                />
                <TextField
                  label="Current rent"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  error={!!errors.rent}
                  helperText={errors.rent || "Monthly rent now (0 if none)"}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
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
                placeholder="e.g. Should I buy now or keep renting?"
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
                    <span>Crunching your numbers…</span>
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

        {/* Result */}
        <Box ref={resultRef} sx={{ scrollMarginTop: 80 }}>
          <AnimatePresence>
            {result && (
              <MotionDiv variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                {/* Verdict */}
                <MotionDiv variants={item}>
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 4,
                      p: { xs: 3, md: 4 },
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: "divider",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: accent }} />
                    <Chip
                      label={result.chipLabel}
                      sx={{ mt: 1, mb: 2, fontWeight: 700, color: "#fff", bgcolor: accent }}
                    />
                    <Typography variant="h4" sx={{ mb: 1.5 }}>
                      {ready ? "You're in a strong position to buy." : "Renting is the smarter move — for now."}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: "1.05rem", lineHeight: 1.6 }}>
                      {result.verdict}
                    </Typography>
                  </Paper>
                </MotionDiv>

                {/* Stats */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mt: 2.5 }}>
                  <MotionDiv variants={item}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider", height: "100%" }}>
                      <Typography variant="overline" color="text.secondary">You can afford</Typography>
                      <Typography variant="h3" sx={{ my: 0.5 }}>
                        <AnimatedNumber value={result.priceMin} format={inrCompact} />
                        {" – "}
                        <AnimatedNumber value={result.priceMax} format={inrCompact} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Based on your income, savings, and a safe EMI limit.
                      </Typography>
                    </Paper>
                  </MotionDiv>
                  <MotionDiv variants={item}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider", height: "100%" }}>
                      <Typography variant="overline" color="text.secondary">Estimated EMI</Typography>
                      <Typography variant="h3" sx={{ my: 0.5 }}>
                        <AnimatedNumber value={result.emi} format={inrFull} />
                        <Box component="span" sx={{ fontSize: "1rem", fontWeight: 600, color: "text.secondary" }}>/mo</Box>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        At {result.assumptions.interestPct}% over {result.tenureYears} years.
                      </Typography>
                    </Paper>
                  </MotionDiv>
                </Box>

                {/* Jargon */}
                <MotionDiv variants={item}>
                  <Paper elevation={0} sx={{ mt: 2.5, p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Jargon, explained</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
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
                        <MotionDiv
                          key={openTerm}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <Box
                            sx={{
                              mt: 2,
                              p: 2,
                              bgcolor: "#F1F5F9",
                              borderRadius: 2,
                              borderLeft: "3px solid",
                              borderColor: "primary.main",
                            }}
                          >
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

                {/* Next steps */}
                <MotionDiv variants={item}>
                  <Paper elevation={0} sx={{ mt: 2.5, p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Your next steps</Typography>
                    <Stack spacing={2}>
                      {result.nextSteps.map((s, i) => (
                        <Stack key={i} direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                          <Box
                            sx={{
                              flexShrink: 0,
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              bgcolor: "primary.light",
                              color: "primary.dark",
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                            }}
                          >
                            {i + 1}
                          </Box>
                          <Typography sx={{ pt: 0.3 }}>{s}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </MotionDiv>

                {/* Assumptions + actions */}
                <MotionDiv variants={item}>
                  <Box sx={{ mt: 2.5, p: 2.5, bgcolor: "#F1F5F9", borderRadius: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      <b>Assumptions:</b> {result.assumptions.interestPct}% annual interest ·{" "}
                      {result.tenureYears}-year tenure · {result.assumptions.downPaymentPct}% down payment ·
                      EMI capped at {result.assumptions.emiToIncomeCapPct}% of income. haus gives educational
                      guidance, not financial advice.
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2.5 }}>
                    <Button variant="contained" color="success" startIcon={<FavoriteRoundedIcon />} onClick={() => setSnack(true)}>
                      This helped me
                    </Button>
                    <Button variant="text" onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>
                      Edit my details
                    </Button>
                  </Stack>
                </MotionDiv>
              </MotionDiv>
            )}
          </AnimatePresence>
        </Box>
      </Container>

      <Snackbar
        open={snack}
        autoHideDuration={2600}
        onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
          Glad it helped 💙
        </Alert>
      </Snackbar>
    </>
  );
}

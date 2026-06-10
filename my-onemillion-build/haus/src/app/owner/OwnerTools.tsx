"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  LinearProgress,
} from "@mui/material";
import { MARKETS, getMarket, DEFAULT_MARKET, fmtFull, fmtCompact, type Market } from "@/lib/markets";
import {
  prepayResult,
  refinanceResult,
  equityResult,
  sellVsRent,
  monthsToYrMo,
} from "@/lib/owner";

const MotionDiv = motion.div;
const toNum = (s: string) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;

// Currency-appropriate starting numbers, derived from each market's sample.
function defaultsFor(m: Market) {
  const homeValue = Math.round(m.sample.income * 80);
  return {
    value: String(homeValue),
    loan: String(Math.round(homeValue * 0.5)),
    rate: String(m.interestPct),
    years: "15",
    lump: String(Math.round(homeValue * 0.05)),
    newRate: String(Math.max(1, m.interestPct - 1)),
    rent: String(Math.round(m.sample.rent * 1.1)),
  };
}

// A small labelled result line.
function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary">{label}</Typography>
      <Typography variant="h5" sx={{ color: accent ?? "text.primary", fontWeight: 800 }}>{value}</Typography>
    </Box>
  );
}

const cardSx = { p: { xs: 2.5, md: 3 }, borderRadius: 4, border: "1px solid", borderColor: "divider" } as const;
const GREEN = "#16A34A";
const AMBER = "#D97706";

export default function OwnerTools() {
  const [market, setMarket] = useState<Market>(DEFAULT_MARKET);
  const [vals, setVals] = useState(() => defaultsFor(DEFAULT_MARKET));
  const [tab, setTab] = useState(0);
  const [mode, setMode] = useState<"prepay" | "refinance">("prepay");

  function changeMarket(code: string) {
    const m = getMarket(code);
    setMarket(m);
    setVals(defaultsFor(m));
  }
  const set = (k: keyof ReturnType<typeof defaultsFor>) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [k]: e.target.value }));

  const cur = market.currencySymbol;
  const full = (n: number) => fmtFull(n, market);
  const compact = (n: number) => fmtCompact(n, market);

  // Live calculations.
  const prepay = prepayResult(toNum(vals.loan), toNum(vals.rate), toNum(vals.years), toNum(vals.lump));
  const refi = refinanceResult(toNum(vals.loan), toNum(vals.rate), toNum(vals.newRate), toNum(vals.years));
  const eq = equityResult(toNum(vals.value), toNum(vals.loan));
  const sr = sellVsRent(toNum(vals.value), toNum(vals.loan), toNum(vals.rent));

  return (
    <Box>
      {/* Country picker */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 3 }}>
        <Typography color="text.secondary">Pick your country so the currency and rates match.</Typography>
        <TextField select label="Country" value={market.code} onChange={(e) => changeMarket(e.target.value)} sx={{ minWidth: 200 }}>
          {MARKETS.map((m) => (
            <MenuItem key={m.code} value={m.code}>{m.flag}&nbsp;&nbsp;{m.name}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Tab label="🔄 Prepay / refinance" sx={{ textTransform: "none", fontWeight: 600 }} />
        <Tab label="📈 Equity tracker" sx={{ textTransform: "none", fontWeight: 600 }} />
        <Tab label="⚖️ Sell vs. rent-out" sx={{ textTransform: "none", fontWeight: 600 }} />
      </Tabs>

      <AnimatePresence mode="wait">
        <MotionDiv key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

          {/* ---------- TAB 0: Prepay / refinance ---------- */}
          {tab === 0 && (
            <Stack spacing={2.5}>
              <ToggleButtonGroup
                exclusive
                value={mode}
                onChange={(_e, v) => v && setMode(v)}
                size="small"
                color="primary"
              >
                <ToggleButton value="prepay" sx={{ textTransform: "none", px: 2.5 }}>Pay a lump sum</ToggleButton>
                <ToggleButton value="refinance" sx={{ textTransform: "none", px: 2.5 }}>Switch to lower rate</ToggleButton>
              </ToggleButtonGroup>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                <TextField label="Outstanding loan" value={vals.loan} onChange={set("loan")} slotProps={{ input: { startAdornment: <InputAdornment position="start">{cur}</InputAdornment> } }} />
                <TextField label="Current interest rate" value={vals.rate} onChange={set("rate")} slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
                <TextField label="Years left on loan" value={vals.years} onChange={set("years")} />
                {mode === "prepay" ? (
                  <TextField label="Lump sum you'd pay now" value={vals.lump} onChange={set("lump")} slotProps={{ input: { startAdornment: <InputAdornment position="start">{cur}</InputAdornment> } }} />
                ) : (
                  <TextField label="New interest rate" value={vals.newRate} onChange={set("newRate")} slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
                )}
              </Box>

              {mode === "prepay" ? (
                <Paper elevation={0} sx={{ ...cardSx, bgcolor: (t) => (t.palette.mode === "light" ? "#F0FDF4" : "rgba(34,197,94,0.10)"), borderColor: (t) => (t.palette.mode === "light" ? "#BBF7D0" : "rgba(34,197,94,0.28)") }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ flexWrap: "wrap" }} useFlexGap>
                    <Stat label="Interest you'd save" value={full(prepay.interestSaved)} accent={GREEN} />
                    <Stat label="Loan-free sooner by" value={monthsToYrMo(prepay.monthsSaved)} accent={GREEN} />
                    <Stat label="Your EMI stays" value={`${full(prepay.emi)}/mo`} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Paying {full(toNum(vals.lump))} now (while keeping the same monthly EMI) clears your loan about{" "}
                    <b>{monthsToYrMo(prepay.monthsSaved)}</b> earlier and saves roughly <b>{full(prepay.interestSaved)}</b> in interest.
                  </Typography>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ ...cardSx, bgcolor: (t) => (t.palette.mode === "light" ? "#F0FDF4" : "rgba(34,197,94,0.10)"), borderColor: (t) => (t.palette.mode === "light" ? "#BBF7D0" : "rgba(34,197,94,0.28)") }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ flexWrap: "wrap" }} useFlexGap>
                    <Stat label="New monthly EMI" value={`${full(refi.newEmi)}/mo`} accent={refi.monthlySaving > 0 ? GREEN : AMBER} />
                    <Stat label="You save each month" value={`${full(Math.max(0, refi.monthlySaving))}/mo`} accent={GREEN} />
                    <Stat label="Total saved (rest of loan)" value={full(Math.max(0, refi.totalSaving))} accent={GREEN} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {refi.monthlySaving > 0
                      ? <>Switching from {vals.rate}% to {vals.newRate}% drops your EMI from {full(refi.oldEmi)} to {full(refi.newEmi)} — about <b>{full(refi.totalSaving)}</b> saved over the remaining years. Check any switching/processing fee before deciding.</>
                      : <>The new rate isn’t lower than your current one, so there’s nothing to save here. Try a rate below {vals.rate}%.</>}
                  </Typography>
                </Paper>
              )}
            </Stack>
          )}

          {/* ---------- TAB 1: Equity tracker ---------- */}
          {tab === 1 && (
            <Stack spacing={2.5}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                <TextField label="Home's current value" value={vals.value} onChange={set("value")} slotProps={{ input: { startAdornment: <InputAdornment position="start">{cur}</InputAdornment> } }} />
                <TextField label="Outstanding loan" value={vals.loan} onChange={set("loan")} slotProps={{ input: { startAdornment: <InputAdornment position="start">{cur}</InputAdornment> } }} />
              </Box>
              <Paper elevation={0} sx={{ ...cardSx }}>
                <Stat label="Equity — the part you own" value={`${compact(eq.equity)} (${eq.equityPct.toFixed(0)}%)`} accent={GREEN} />
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">You own {eq.equityPct.toFixed(0)}%</Typography>
                    <Typography variant="caption" color="text.secondary">Bank holds {eq.ltvPct.toFixed(0)}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={Math.min(100, eq.equityPct)} sx={{ height: 12, borderRadius: 6, bgcolor: (t) => (t.palette.mode === "light" ? "#FEF3C7" : "rgba(245,158,11,0.20)"), "& .MuiLinearProgress-bar": { bgcolor: GREEN, borderRadius: 6 } }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Of your {compact(toNum(vals.value))} home, you truly own <b>{compact(eq.equity)}</b>. The rest is still owed to the bank
                  (a {eq.ltvPct.toFixed(0)}% loan-to-value). As you repay or as the home’s value rises, your equity grows.
                </Typography>
              </Paper>
            </Stack>
          )}

          {/* ---------- TAB 2: Sell vs. rent-out ---------- */}
          {tab === 2 && (
            <Stack spacing={2.5}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 2.5 }}>
                <TextField label="Home's current value" value={vals.value} onChange={set("value")} slotProps={{ input: { startAdornment: <InputAdornment position="start">{cur}</InputAdornment> } }} />
                <TextField label="Outstanding loan" value={vals.loan} onChange={set("loan")} slotProps={{ input: { startAdornment: <InputAdornment position="start">{cur}</InputAdornment> } }} />
                <TextField label="Rent you could get / mo" value={vals.rent} onChange={set("rent")} slotProps={{ input: { startAdornment: <InputAdornment position="start">{cur}</InputAdornment> } }} />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                <Paper elevation={0} sx={{ ...cardSx }}>
                  <Typography variant="h6" sx={{ mb: 1.5 }}>💰 Sell now</Typography>
                  <Stat label="Cash in your pocket" value={compact(sr.netSaleProceeds)} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    After clearing the {compact(toNum(vals.loan))} loan and ~2% selling costs ({compact(sr.sellingCost)}).
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ ...cardSx }}>
                  <Typography variant="h6" sx={{ mb: 1.5 }}>🏠 Rent it out</Typography>
                  <Stat label="Yearly rental income" value={`${compact(sr.annualRent)} (${sr.grossYieldPct.toFixed(1)}% yield)`} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    You keep the home (and any future price rise) while it earns you rent.
                  </Typography>
                </Paper>
              </Box>

              <Paper elevation={0} sx={{ ...cardSx, bgcolor: (t) => (t.palette.mode === "light" ? "#EEF2FF" : "rgba(129,140,248,0.12)"), borderColor: (t) => (t.palette.mode === "light" ? "#C7D2FE" : "rgba(129,140,248,0.30)") }}>
                <Chip
                  label={sr.verdict === "rent" ? "Renting out looks attractive" : sr.verdict === "sell" ? "Selling may serve you better" : "It's a balanced call"}
                  sx={{ fontWeight: 700, color: "#fff", bgcolor: sr.verdict === "sell" ? AMBER : "#4F46E5", mb: 1.5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {sr.verdict === "rent" && <>Your rental yield is <b>{sr.grossYieldPct.toFixed(1)}%</b> — healthy. Renting out earns steady income while the home keeps gaining value. Selling would hand you {compact(sr.netSaleProceeds)} today if you need the lump sum instead.</>}
                  {sr.verdict === "sell" && <>Your rental yield is only <b>{sr.grossYieldPct.toFixed(1)}%</b> — modest. Selling frees up {compact(sr.netSaleProceeds)} that you might grow faster elsewhere. Rent out only if you strongly expect the home’s price to keep climbing.</>}
                  {sr.verdict === "balanced" && <>At a <b>{sr.grossYieldPct.toFixed(1)}%</b> yield it’s close. Rent out if you value steady income and future price growth; sell if you’d rather have {compact(sr.netSaleProceeds)} in hand now.</>}
                </Typography>
              </Paper>
            </Stack>
          )}

        </MotionDiv>
      </AnimatePresence>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 3 }}>
        Educational guidance, not financial advice. Real rates, taxes, and fees vary — confirm with your lender.
      </Typography>
    </Box>
  );
}

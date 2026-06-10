"use client";

import { useMemo, useState } from "react";
import { Box, Paper, Typography, Slider, TextField, InputAdornment, Chip, Stack } from "@mui/material";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
import { computeResult } from "@/lib/haus";
import { fmtCompact, type Market } from "@/lib/markets";

const toNum = (s: string) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;

function ScenarioCard({ title, status, priceMax, priceMin, emi, market, highlight }: {
  title: string; status: "ready" | "rent"; priceMax: number; priceMin: number; emi: number; market: Market; highlight?: boolean;
}) {
  const ready = status === "ready";
  const compact = (n: number) => fmtCompact(n, market);
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5, borderRadius: 3, height: "100%",
        border: "1px solid", borderColor: highlight ? "primary.main" : "divider",
        bgcolor: highlight ? (t) => (t.palette.mode === "light" ? "rgba(79,70,229,0.04)" : "rgba(99,102,241,0.08)") : "transparent",
      }}
    >
      <Typography variant="overline" color="text.secondary">{title}</Typography>
      <Chip
        label={ready ? "Ready to buy" : "Rent for now"}
        size="small"
        sx={{ display: "block", width: "fit-content", my: 1, fontWeight: 700, color: "#fff", bgcolor: ready ? "#16A34A" : "#D97706" }}
      />
      <Typography variant="caption" color="text.secondary">You can afford</Typography>
      <Typography variant="h6" sx={{ mb: 1, lineHeight: 1.2 }}>{compact(priceMin)} – {compact(priceMax)}</Typography>
      <Typography variant="caption" color="text.secondary">Estimated EMI</Typography>
      <Typography sx={{ fontWeight: 700 }}>{compact(emi)}/mo</Typography>
    </Paper>
  );
}

export default function CompareScenarios({
  income, savings, rent, age, goal, market,
}: {
  income: number; savings: number; rent: number; age: number; goal: string; market: Market;
}) {
  const [waitYears, setWaitYears] = useState(2);
  // Sensible default monthly saving: ~40% of income left after rent.
  const defaultSaving = Math.max(0, Math.round((income - rent) * 0.4));
  const [saving, setSaving] = useState(String(defaultSaving));

  const monthlySaving = toNum(saving);

  const now = useMemo(() => computeResult({ income, savings, rent, age, goal }, market), [income, savings, rent, age, goal, market]);
  const future = useMemo(() => {
    const savingsFuture = savings + monthlySaving * 12 * waitYears;
    return computeResult({ income, savings: savingsFuture, rent, age: age + waitYears, goal }, market);
  }, [income, savings, rent, age, goal, market, monthlySaving, waitYears]);

  const compact = (n: number) => fmtCompact(n, market);
  const diff = future.priceMax - now.priceMax;
  const cur = market.currencySymbol;

  return (
    <Paper elevation={0} sx={{ mt: 2.5, p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#4F46E5,#9333EA)", color: "#fff", flexShrink: 0 }}>
          <EventRepeatRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h6">Buy now vs. wait &amp; save</Typography>
          <Typography variant="body2" color="text.secondary">See how waiting and saving could change your budget.</Typography>
        </Box>
      </Stack>

      {/* Controls */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ mt: 3, alignItems: { sm: "center" } }}>
        <Box sx={{ flex: 1, width: "100%" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Wait for</Typography>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>{waitYears} {waitYears === 1 ? "year" : "years"}</Typography>
          </Stack>
          <Slider value={waitYears} onChange={(_, v) => setWaitYears(v as number)} min={1} max={5} step={1} marks aria-label="Years to wait" />
        </Box>
        <TextField
          label="Saving per month"
          value={saving}
          onChange={(e) => setSaving(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start">{cur}</InputAdornment> } }}
          sx={{ minWidth: 170 }}
        />
      </Stack>

      {/* Side-by-side */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 3 }}>
        <ScenarioCard title="Buy now" status={now.status} priceMin={now.priceMin} priceMax={now.priceMax} emi={now.emi} market={market} />
        <ScenarioCard title={`In ${waitYears} ${waitYears === 1 ? "year" : "years"}`} status={future.status} priceMin={future.priceMin} priceMax={future.priceMax} emi={future.emi} market={market} highlight />
      </Box>

      {/* Takeaway */}
      <Typography sx={{ mt: 2.5, fontSize: "1.02rem", lineHeight: 1.6 }}>
        {diff > 0 ? (
          <>Waiting <b>{waitYears} {waitYears === 1 ? "year" : "years"}</b> and saving <b>{compact(monthlySaving)}/mo</b> could lift your budget from{" "}
            <Box component="span" sx={{ fontWeight: 800 }}>{compact(now.priceMax)}</Box> to{" "}
            <Box component="span" sx={{ fontWeight: 800, color: "primary.main" }}>{compact(future.priceMax)}</Box> — about <b>{compact(diff)}</b> more.
            {now.status === "ready" && " You're already in a position to buy now, so this is about reaching for more, not necessity."}
          </>
        ) : (
          <>Waiting doesn&apos;t raise your budget much here — your borrowing power is the limit, not your savings. {now.status === "ready" ? "You're ready to buy now." : "Growing your income would move the needle more than waiting."}</>
        )}
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        Assumes your income and rent stay flat and savings grow only by what you set aside (not counting investment growth). Guidance, not financial advice.
      </Typography>
    </Paper>
  );
}

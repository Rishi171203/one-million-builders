"use client";

import { useMemo, useState } from "react";
import { Box, Paper, Typography, Slider, Chip, Stack } from "@mui/material";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { fmtCompact, type Market } from "@/lib/markets";
import { computeRentVsBuy, DEFAULT_RVB_ASSUMPTIONS, type RvbPoint } from "@/lib/rentVsBuy";

// Dependency-free SVG line chart of net worth over the years (buy vs rent).
function NetWorthChart({ series, market }: { series: RvbPoint[]; market: Market }) {
  const W = 320;
  const H = 170;
  const pad = { l: 8, r: 8, t: 12, b: 22 };
  const n = series.length;
  if (n < 2) return null;

  const vals = series.flatMap((p) => [p.buyNetWorth, p.rentNetWorth]);
  const yMax = Math.max(...vals, 1);
  const yMin = Math.min(...vals, 0);
  const span = yMax - yMin || 1;

  const xFor = (i: number) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
  const yFor = (v: number) => pad.t + (1 - (v - yMin) / span) * (H - pad.t - pad.b);
  const line = (key: "buyNetWorth" | "rentNetWorth") =>
    series.map((p, i) => `${xFor(i)},${yFor(p[key])}`).join(" ");

  const zeroY = yFor(0);

  return (
    <Box sx={{ mt: 2 }}>
      <Box component="svg" viewBox={`0 0 ${W} ${H}`} sx={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Net worth over time: buying versus renting and investing">
        {/* zero baseline */}
        {yMin < 0 && <line x1={pad.l} y1={zeroY} x2={W - pad.r} y2={zeroY} stroke="currentColor" strokeOpacity="0.18" strokeDasharray="3 3" />}
        {/* rent line */}
        <polyline points={line("rentNetWorth")} fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* buy line */}
        <polyline points={line("buyNetWorth")} fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* endpoint dots */}
        <circle cx={xFor(n - 1)} cy={yFor(series[n - 1].buyNetWorth)} r="3.5" fill="#4F46E5" />
        <circle cx={xFor(n - 1)} cy={yFor(series[n - 1].rentNetWorth)} r="3.5" fill="#16A34A" />
        {/* x labels */}
        <text x={pad.l} y={H - 6} fontSize="10" fill="currentColor" fillOpacity="0.55">Year 1</text>
        <text x={W - pad.r} y={H - 6} fontSize="10" textAnchor="end" fill="currentColor" fillOpacity="0.55">Year {n}</text>
      </Box>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "center", mt: 0.5 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 12, height: 3, borderRadius: 2, bgcolor: "#4F46E5" }} />
          <Typography variant="caption" color="text.secondary">Buy</Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 12, height: 3, borderRadius: 2, bgcolor: "#16A34A" }} />
          <Typography variant="caption" color="text.secondary">Rent &amp; invest</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">· up to {fmtCompact(yMax, market)}</Typography>
      </Stack>
    </Box>
  );
}

// One compact labelled slider for a what-if assumption.
function AssumptionSlider({ label, value, onChange, max }: { label: string; value: number; onChange: (v: number) => void; max: number }) {
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>{label}</Typography>
        <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>{value}%/yr</Typography>
      </Stack>
      <Slider value={value} onChange={(_, v) => onChange(v as number)} min={0} max={max} step={0.5} size="small" aria-label={label} />
    </Box>
  );
}

export default function RentVsBuy({
  price,
  monthlyRent,
  tenureYears,
  market,
}: {
  price: number;
  monthlyRent: number;
  tenureYears: number;
  market: Market;
}) {
  const [years, setYears] = useState(7);
  // What-if assumptions the user can play with (the rest stay at defaults).
  const [appreciationPct, setAppreciationPct] = useState(DEFAULT_RVB_ASSUMPTIONS.appreciationPct);
  const [rentGrowthPct, setRentGrowthPct] = useState(DEFAULT_RVB_ASSUMPTIONS.rentGrowthPct);
  const [investReturnPct, setInvestReturnPct] = useState(DEFAULT_RVB_ASSUMPTIONS.investReturnPct);

  const assumptions = useMemo(
    () => ({ ...DEFAULT_RVB_ASSUMPTIONS, appreciationPct, rentGrowthPct, investReturnPct }),
    [appreciationPct, rentGrowthPct, investReturnPct]
  );

  const r = useMemo(
    () => computeRentVsBuy(price, monthlyRent, years, market, tenureYears, assumptions),
    [price, monthlyRent, years, market, tenureYears, assumptions]
  );

  const compact = (n: number) => fmtCompact(n, market);
  const buyWins = r.winner === "buy";
  const maxNW = Math.max(r.buyNetWorth, r.rentNetWorth, 1);

  return (
    <Paper elevation={0} sx={{ mt: 2.5, p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#4F46E5,#9333EA)", color: "#fff", flexShrink: 0 }}>
          <CompareArrowsRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h6">Rent vs. buy over time</Typography>
          <Typography variant="body2" color="text.secondary">
            Which leaves you richer — buying, or renting and investing the difference?
          </Typography>
        </Box>
      </Stack>

      {monthlyRent <= 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: (t) => (t.palette.mode === "light" ? "#F1F5F9" : "rgba(148,163,184,0.10)") }}>
          Tip: add your current rent above to make this comparison realistic.
        </Typography>
      )}

      {/* Years control */}
      <Box sx={{ mt: 3 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Compare over</Typography>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>{years} years</Typography>
        </Stack>
        <Slider
          value={years}
          onChange={(_, v) => setYears(v as number)}
          min={3}
          max={20}
          step={1}
          marks={[{ value: 5, label: "5y" }, { value: 10, label: "10y" }, { value: 15, label: "15y" }, { value: 20, label: "20y" }]}
          aria-label="Years to compare"
        />
      </Box>

      {/* Verdict */}
      <Box sx={{ mt: 1.5 }}>
        <Chip
          label={buyWins ? "Buying wins" : "Renting + investing wins"}
          sx={{ fontWeight: 700, color: "#fff", bgcolor: buyWins ? "#4F46E5" : "#16A34A", mb: 1.5 }}
        />
        <Typography sx={{ fontSize: "1.05rem", lineHeight: 1.6 }}>
          Over <b>{years} years</b>, {buyWins ? "buying" : "renting and investing the difference"} could leave you about{" "}
          <Box component="span" sx={{ fontWeight: 800, color: buyWins ? "primary.main" : "#16A34A" }}>{compact(r.gap)}</Box>{" "}
          better off{buyWins ? "" : " than buying"}.
        </Typography>
      </Box>

      {/* Chart */}
      <NetWorthChart series={r.series} market={market} />

      {/* Comparison bars */}
      <Stack spacing={2} sx={{ mt: 3 }}>
        {[
          { label: "If you buy", value: r.buyNetWorth, color: "#4F46E5", win: buyWins, sub: `Home worth ${compact(r.homeValue)} · equity ${compact(r.equity)}` },
          { label: "If you rent & invest", value: r.rentNetWorth, color: "#16A34A", win: !buyWins, sub: `Down payment + monthly savings, invested` },
        ].map((row) => (
          <Box key={row.label}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: row.win ? 800 : 600 }}>
                {row.label}{row.win && " 🏆"}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>{compact(row.value)}</Typography>
            </Stack>
            <Box sx={{ height: 14, borderRadius: 7, bgcolor: (t) => (t.palette.mode === "light" ? "#EEF2FF" : "rgba(148,163,184,0.14)"), overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  width: `${Math.max(4, (row.value / maxNW) * 100)}%`,
                  borderRadius: 7,
                  background: `linear-gradient(90deg, ${row.color}, ${row.color}cc)`,
                  transition: "width 500ms cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">{row.sub}</Typography>
          </Box>
        ))}
      </Stack>

      {/* What-if assumption sliders */}
      <Box sx={{ mt: 3, p: 2, borderRadius: 3, border: "1px dashed", borderColor: "divider" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
          <TuneRoundedIcon fontSize="small" color="action" />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>Play with the assumptions</Typography>
        </Stack>
        <Stack spacing={1.5}>
          <AssumptionSlider label="Home grows" value={appreciationPct} onChange={setAppreciationPct} max={10} />
          <AssumptionSlider label="Rent rises" value={rentGrowthPct} onChange={setRentGrowthPct} max={10} />
          <AssumptionSlider label="Investments return" value={investReturnPct} onChange={setInvestReturnPct} max={15} />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
          Also assumed: upkeep + tax {r.assumptions.maintenancePct}%/yr · {r.assumptions.sellingCostPct}% selling cost. A simplified model for guidance, not financial advice.
        </Typography>
      </Box>
    </Paper>
  );
}

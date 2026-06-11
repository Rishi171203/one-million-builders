"use client";

import { useMemo, useState } from "react";
import { Box, Paper, Typography, Slider, Chip, Stack } from "@mui/material";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { fmtCompact, type Market } from "@/lib/markets";
import { computeRentVsBuy, DEFAULT_RVB_ASSUMPTIONS, type RvbPoint } from "@/lib/rentVsBuy";

const BUY_COLOR = "#4F46E5";
const RENT_COLOR = "#16A34A";

// Pick a "nice" round step (1/2/5 × 10ⁿ) so the money gridlines land on tidy numbers.
function niceStep(range: number, targetTicks: number) {
  const raw = range / Math.max(1, targetTicks);
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const norm = raw / mag;
  const step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  return step * mag;
}

// Dependency-free SVG line chart of net worth over the years (buy vs rent),
// with a money axis, year axis, shaded gap, and the crossover point marked.
function NetWorthChart({ series, market }: { series: RvbPoint[]; market: Market }) {
  const W = 540;
  const H = 300;
  const pad = { l: 58, r: 74, t: 18, b: 40 };
  const n = series.length;
  if (n < 2) return null;

  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const vals = series.flatMap((p) => [p.buyNetWorth, p.rentNetWorth]);
  const dataMax = Math.max(...vals, 1);
  const dataMin = Math.min(...vals, 0); // always include 0 baseline for honest scale

  // Build tidy money gridlines spanning [axisMin, axisMax].
  const step = niceStep(dataMax - dataMin, 4);
  const axisMin = Math.floor(dataMin / step) * step;
  const axisMax = Math.ceil(dataMax / step) * step;
  const span = axisMax - axisMin || 1;
  const ticks: number[] = [];
  for (let v = axisMin; v <= axisMax + step * 0.001; v += step) ticks.push(v);

  const xFor = (i: number) => pad.l + (i / (n - 1)) * plotW;
  const yFor = (v: number) => pad.t + (1 - (v - axisMin) / span) * plotH;
  const pts = (key: "buyNetWorth" | "rentNetWorth") =>
    series.map((p, i) => `${xFor(i).toFixed(1)},${yFor(p[key]).toFixed(1)}`).join(" ");

  // Shaded gap = buy line forward, then rent line backward → a filled band.
  const gapPath =
    series.map((p, i) => `${xFor(i).toFixed(1)},${yFor(p.buyNetWorth).toFixed(1)}`).join(" ") +
    " " +
    series
      .map((p, i) => `${xFor(n - 1 - i).toFixed(1)},${yFor(series[n - 1 - i].rentNetWorth).toFixed(1)}`)
      .join(" ");
  const buyWins = series[n - 1].buyNetWorth >= series[n - 1].rentNetWorth;

  // Find the crossover (where the two lines swap places), if any.
  let cross: { x: number; year: number } | null = null;
  for (let i = 1; i < n; i++) {
    const d0 = series[i - 1].buyNetWorth - series[i - 1].rentNetWorth;
    const d1 = series[i].buyNetWorth - series[i].rentNetWorth;
    if (d0 === 0 || (d0 < 0) !== (d1 < 0)) {
      const t = d0 === d1 ? 0 : d0 / (d0 - d1);
      cross = { x: xFor(i - 1 + t), year: series[i - 1].year + t * (series[i].year - series[i - 1].year) };
      break;
    }
  }

  // A few year labels along the bottom.
  const xStep = Math.max(1, Math.ceil((n - 1) / 4));
  const xLabelIdx = [0];
  for (let i = xStep; i < n - 1; i += xStep) xLabelIdx.push(i);
  xLabelIdx.push(n - 1);

  // End-of-line value chips (line colour, white text → legible on any background).
  const endChip = (value: number, color: string) => {
    const cy = Math.min(pad.t + plotH - 9, Math.max(pad.t + 9, yFor(value)));
    return { x: W - pad.r + 6, y: cy, label: fmtCompact(value, market), color };
  };
  const buyChip = endChip(series[n - 1].buyNetWorth, BUY_COLOR);
  const rentChip = endChip(series[n - 1].rentNetWorth, RENT_COLOR);
  if (Math.abs(buyChip.y - rentChip.y) < 20) {
    // nudge apart if the two endpoints are close
    if (buyChip.y <= rentChip.y) { buyChip.y -= 10; rentChip.y += 10; }
    else { buyChip.y += 10; rentChip.y -= 10; }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box component="svg" viewBox={`0 0 ${W} ${H}`} sx={{ width: "100%", height: "auto", display: "block", color: "text.secondary" }} role="img" aria-label="Net worth over time: buying versus renting and investing">
        {/* horizontal money gridlines + labels */}
        {ticks.map((tv) => (
          <g key={tv}>
            <line x1={pad.l} y1={yFor(tv)} x2={pad.l + plotW} y2={yFor(tv)} stroke="currentColor" strokeOpacity={tv === 0 ? 0.35 : 0.12} strokeDasharray={tv === 0 ? undefined : "3 3"} />
            <text x={pad.l - 8} y={yFor(tv) + 3.5} fontSize="11" textAnchor="end" fill="currentColor" fillOpacity="0.7">{fmtCompact(tv, market)}</text>
          </g>
        ))}

        {/* shaded gap between the two lines */}
        <polygon points={gapPath} fill={buyWins ? BUY_COLOR : RENT_COLOR} fillOpacity="0.10" />

        {/* the two lines */}
        <polyline points={pts("rentNetWorth")} fill="none" stroke={RENT_COLOR} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={pts("buyNetWorth")} fill="none" stroke={BUY_COLOR} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {/* data dots with native hover tooltips (year + both values) */}
        {series.map((p, i) => (
          <g key={i}>
            <circle cx={xFor(i)} cy={yFor(p.buyNetWorth)} r="2.2" fill={BUY_COLOR} />
            <circle cx={xFor(i)} cy={yFor(p.rentNetWorth)} r="2.2" fill={RENT_COLOR} />
            <rect x={xFor(i) - (plotW / (n - 1)) / 2} y={pad.t} width={plotW / (n - 1)} height={plotH} fill="transparent">
              <title>{`Year ${p.year} — Buy: ${fmtCompact(p.buyNetWorth, market)} · Rent & invest: ${fmtCompact(p.rentNetWorth, market)}`}</title>
            </rect>
          </g>
        ))}

        {/* crossover marker */}
        {cross && (
          <g>
            <line x1={cross.x} y1={pad.t} x2={cross.x} y2={pad.t + plotH} stroke="currentColor" strokeOpacity="0.45" strokeDasharray="4 3" />
            <text x={cross.x} y={pad.t - 5} fontSize="10.5" textAnchor="middle" fill="currentColor" fillOpacity="0.75">they cross ~yr {Math.round(cross.year)}</text>
          </g>
        )}

        {/* end-of-line value chips */}
        {[{ c: buyChip }, { c: rentChip }].map(({ c }, i) => (
          <g key={i}>
            <rect x={c.x} y={c.y - 9} rx="5" width="62" height="18" fill={c.color} />
            <text x={c.x + 31} y={c.y + 3.5} fontSize="11" fontWeight="700" textAnchor="middle" fill="#fff">{c.label}</text>
          </g>
        ))}

        {/* year axis labels */}
        {xLabelIdx.map((i) => (
          <text key={i} x={xFor(i)} y={H - 16} fontSize="11" textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fill="currentColor" fillOpacity="0.7">
            Yr {series[i].year}
          </text>
        ))}
        <text x={pad.l + plotW / 2} y={H - 2} fontSize="10.5" textAnchor="middle" fill="currentColor" fillOpacity="0.55">Years from now →</text>
      </Box>

      <Stack direction="row" spacing={2.5} sx={{ justifyContent: "center", mt: 1, flexWrap: "wrap" }} useFlexGap>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 14, height: 3, borderRadius: 2, bgcolor: BUY_COLOR }} />
          <Typography variant="caption" color="text.secondary">Buy (your net worth)</Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 14, height: 3, borderRadius: 2, bgcolor: RENT_COLOR }} />
          <Typography variant="caption" color="text.secondary">Rent &amp; invest the difference</Typography>
        </Stack>
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

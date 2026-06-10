"use client";

import { useMemo, useState } from "react";
import { Box, Paper, Typography, Slider, Chip, Stack } from "@mui/material";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import { fmtCompact, type Market } from "@/lib/markets";
import { computeRentVsBuy } from "@/lib/rentVsBuy";

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
  const r = useMemo(
    () => computeRentVsBuy(price, monthlyRent, years, market, tenureYears),
    [price, monthlyRent, years, market, tenureYears]
  );

  const compact = (n: number) => fmtCompact(n, market);
  const buyWins = r.winner === "buy";
  // Scale the comparison bars to the larger of the two outcomes.
  const maxNW = Math.max(r.buyNetWorth, r.rentNetWorth, 1);
  const a = r.assumptions;

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

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 3 }}>
        <b>Assumptions:</b> home grows {a.appreciationPct}%/yr · rent rises {a.rentGrowthPct}%/yr · investments return {a.investReturnPct}%/yr ·
        upkeep + tax {a.maintenancePct}%/yr · {a.sellingCostPct}% selling cost. A simplified model for guidance, not financial advice.
      </Typography>
    </Paper>
  );
}

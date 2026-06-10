// haus — homeowner tools math (pure functions, no UI, no external calls).
// Mirrors the style of lib/haus.ts: plain code does the numbers.

// Equated Monthly Installment for a loan.
export function emiForLoan(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

// How many monthly payments are needed to clear `principal` at a fixed `emi`.
function monthsToRepay(principal: number, emi: number, r: number): number {
  if (principal <= 0 || emi <= 0) return 0;
  if (r === 0) return principal / emi;
  if (emi <= principal * r) return Infinity; // EMI too small to ever clear the loan
  return -Math.log(1 - (principal * r) / emi) / Math.log(1 + r);
}

// ---------- 1) Prepay: pay a lump sum, keep the same EMI ----------
export interface PrepayResult {
  emi: number;
  monthsWithout: number;
  monthsWith: number;
  monthsSaved: number;
  interestWithout: number;
  interestWith: number;
  interestSaved: number;
}

export function prepayResult(
  principal: number,
  annualRatePct: number,
  years: number,
  lumpSum: number
): PrepayResult {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  const emi = emiForLoan(principal, annualRatePct, years);
  const newPrincipal = Math.max(0, principal - lumpSum);
  const nPrime = monthsToRepay(newPrincipal, emi, r);

  // Total interest = everything you pay out, minus the principal you actually borrowed.
  const interestWithout = emi * n - principal;
  const interestWith = lumpSum + emi * nPrime - principal;

  return {
    emi,
    monthsWithout: n,
    monthsWith: nPrime,
    monthsSaved: Math.max(0, n - nPrime),
    interestWithout,
    interestWith: Math.max(0, interestWith),
    interestSaved: Math.max(0, interestWithout - interestWith),
  };
}

// ---------- 2) Refinance: switch to a lower interest rate ----------
export interface RefinanceResult {
  oldEmi: number;
  newEmi: number;
  monthlySaving: number;
  totalSaving: number;
}

export function refinanceResult(
  principal: number,
  oldRatePct: number,
  newRatePct: number,
  years: number,
  switchFee = 0
): RefinanceResult {
  const n = years * 12;
  const oldEmi = emiForLoan(principal, oldRatePct, years);
  const newEmi = emiForLoan(principal, newRatePct, years);
  const monthlySaving = oldEmi - newEmi;
  return {
    oldEmi,
    newEmi,
    monthlySaving,
    totalSaving: monthlySaving * n - switchFee,
  };
}

// ---------- 3) Equity: how much of the home you truly own ----------
export interface EquityResult {
  equity: number;
  equityPct: number;
  ltvPct: number;
}

export function equityResult(value: number, loan: number): EquityResult {
  const equity = Math.max(0, value - loan);
  const equityPct = value > 0 ? (equity / value) * 100 : 0;
  const ltvPct = value > 0 ? (Math.min(loan, value) / value) * 100 : 0;
  return { equity, equityPct, ltvPct };
}

// ---------- 4) Sell now vs. rent it out ----------
export interface SellRentResult {
  sellingCost: number;
  netSaleProceeds: number;
  annualRent: number;
  grossYieldPct: number;
  verdict: "rent" | "sell" | "balanced";
}

export function sellVsRent(
  value: number,
  loan: number,
  monthlyRent: number,
  sellingCostPct = 2
): SellRentResult {
  const sellingCost = (value * sellingCostPct) / 100;
  const netSaleProceeds = Math.max(0, value - loan - sellingCost);
  const annualRent = monthlyRent * 12;
  const grossYieldPct = value > 0 ? (annualRent / value) * 100 : 0;

  // Simple, transparent rule of thumb based on rental yield.
  let verdict: SellRentResult["verdict"];
  if (grossYieldPct >= 4) verdict = "rent";
  else if (grossYieldPct < 2.5) verdict = "sell";
  else verdict = "balanced";

  return { sellingCost, netSaleProceeds, annualRent, grossYieldPct, verdict };
}

// Helper: turn a number of months into "12 yrs 3 mo".
export function monthsToYrMo(months: number): string {
  if (!isFinite(months)) return "—";
  const total = Math.round(months);
  const y = Math.floor(total / 12);
  const mo = total % 12;
  const yStr = y > 0 ? `${y} yr${y !== 1 ? "s" : ""}` : "";
  const moStr = mo > 0 ? `${mo} mo` : "";
  return [yStr, moStr].filter(Boolean).join(" ") || "0 mo";
}

// haus — core advisory logic (plain code, per refined-prd.md business rules).
// Market-aware: currency + assumptions come from the selected Market. No external calls.

import { type Market, fmtFull, fmtCompact } from "./markets";

export interface Inputs {
  income: number; // monthly take-home
  savings: number; // current savings
  rent: number; // current monthly rent (0 if none)
  age: number;
  goal: string;
}

export interface Term {
  term: string;
  explanation: string;
}

export interface Result {
  status: "ready" | "rent";
  chipLabel: string;
  verdict: string;
  priceMin: number;
  priceMax: number;
  emi: number;
  loanBoundPrice: number;
  shortfall: number;
  tenureYears: number;
  assumptions: { interestPct: number; tenureYears: number; downPaymentPct: number; emiCapPct: number };
  terms: Term[];
  nextSteps: string[];
}

// Monthly payment for a given loan principal.
function emiForLoan(loan: number, monthlyRate: number, months: number) {
  if (loan <= 0) return 0;
  const f = Math.pow(1 + monthlyRate, months);
  return (loan * monthlyRate * f) / (f - 1);
}

export function computeResult(input: Inputs, m: Market): Result {
  const down = m.downPaymentPct / 100;
  const r = m.interestPct / 100 / 12;

  // Tenure shrinks as you near retirement, capped at 20 years.
  const tenureYears = Math.max(5, Math.min(20, m.retirementAge - input.age));
  const n = tenureYears * 12;

  const maxEmi = (m.emiCapPct / 100) * input.income;
  const maxLoan = (maxEmi * (1 - Math.pow(1 + r, -n))) / r;

  const loanBoundPrice = maxLoan / (1 - down);
  const savingsBoundPrice = input.savings / down;

  const affordable = Math.max(0, Math.min(loanBoundPrice, savingsBoundPrice));
  const priceMax = affordable;
  const priceMin = affordable * 0.85;
  const emi = emiForLoan(priceMax * (1 - down), r, n);

  const savingsIsLimit = savingsBoundPrice < loanBoundPrice;
  const downNeeded = down * loanBoundPrice;
  const shortfall = Math.max(0, downNeeded - input.savings);
  const status: Result["status"] = savingsIsLimit ? "rent" : "ready";

  const full = (v: number) => fmtFull(v, m);
  const compact = (v: number) => fmtCompact(v, m);

  const terms: Term[] = [
    {
      term: "EMI",
      explanation:
        `Equated Monthly Installment — the fixed amount you'd pay the bank each month. ` +
        `Yours would be about ${full(emi)}.`,
    },
    {
      term: "Down payment",
      explanation:
        `The upfront part of the price you pay yourself (here ${m.downPaymentPct}%). ` +
        `On a ${compact(priceMax)} home that's about ${compact(priceMax * down)}.`,
    },
    {
      term: "Tenure",
      explanation:
        `How many years you take to repay the loan — here ${tenureYears} years. ` +
        `A longer tenure means smaller monthly EMIs but more total interest.`,
    },
    {
      term: "Interest rate",
      explanation:
        `The yearly percentage the bank charges on your loan — assumed ${m.interestPct}% for ${m.name}. ` +
        `Real rates vary by bank and your credit profile.`,
    },
    {
      term: "Pre-approval",
      explanation:
        `A bank's early estimate of how much it will lend you, before you pick a home — ` +
        `it makes your budget real and speeds things up later.`,
    },
  ];

  let verdict: string;
  let nextSteps: string[];

  if (status === "ready") {
    verdict =
      `Good news — you're in a strong position to buy. Based on your income and savings, ` +
      `you can comfortably afford a home in the ${compact(priceMin)}–${compact(priceMax)} range, ` +
      `with an estimated EMI of about ${full(emi)}/month — within a safe share of your income.`;
    nextSteps = [
      "Get a home-loan pre-approval to lock in your real budget.",
      "Keep 3–6 months of expenses as a separate emergency fund (don't spend it on the down payment).",
      "Compare interest rates from at least 3 lenders before committing.",
      "Budget ~7–10% extra for taxes, registration, and one-time costs.",
    ];
  } else {
    verdict =
      `Renting is the smarter move for now. You can afford up to about ${compact(priceMax)} today, ` +
      `but that's limited by your savings rather than your income. Save roughly ${compact(shortfall)} more ` +
      `toward your down payment and your budget could rise to around ${compact(loanBoundPrice)}. ` +
      `Renting a little longer while you build that cushion puts you in a much stronger position.`;
    nextSteps = [
      `Keep renting and aim to save about ${compact(shortfall)} more toward your down payment.`,
      "Park that down-payment money somewhere low-risk so it's ready when you are.",
      "Keep 3–6 months of expenses as a separate emergency fund.",
      'Re-run haus as your savings grow to see when the verdict flips to "buy".',
    ];
  }

  return {
    status,
    chipLabel: status === "ready" ? "You're ready to buy" : "Rent for now",
    verdict,
    priceMin,
    priceMax,
    emi,
    loanBoundPrice,
    shortfall,
    tenureYears,
    assumptions: {
      interestPct: m.interestPct,
      tenureYears,
      downPaymentPct: m.downPaymentPct,
      emiCapPct: m.emiCapPct,
    },
    terms,
    nextSteps,
  };
}

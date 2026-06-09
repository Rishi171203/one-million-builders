// haus — core advisory logic (plain code, per refined-prd.md business rules).
// All money in INR. No external calls; fully standalone.

export const ASSUMPTIONS = {
  interestPct: 8.5, // annual interest rate assumption
  tenureCapYears: 20, // max loan tenure
  downPaymentPct: 20, // minimum down payment (% of price)
  emiToIncomeCapPct: 40, // EMI must not exceed this % of monthly income
};

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
  shortfall: number; // extra savings needed to reach income-based budget
  tenureYears: number;
  assumptions: typeof ASSUMPTIONS;
  terms: Term[];
  nextSteps: string[];
}

// ---- formatting helpers ----
export const inrFull = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export const inrCompact = (n: number) => {
  const v = Math.round(n);
  if (v >= 1e7) return "₹" + (v / 1e7).toFixed(2).replace(/\.?0+$/, "") + " Cr";
  if (v >= 1e5) return "₹" + (v / 1e5).toFixed(1).replace(/\.0$/, "") + " L";
  return "₹" + v.toLocaleString("en-IN");
};

// Monthly payment for a given loan principal.
function emiForLoan(loan: number, monthlyRate: number, months: number) {
  if (loan <= 0) return 0;
  const f = Math.pow(1 + monthlyRate, months);
  return (loan * monthlyRate * f) / (f - 1);
}

export function computeResult(input: Inputs): Result {
  const { interestPct, tenureCapYears, downPaymentPct, emiToIncomeCapPct } = ASSUMPTIONS;
  const down = downPaymentPct / 100;
  const r = interestPct / 100 / 12;

  // Tenure shrinks as you near retirement (~60), capped at 20 years.
  const tenureYears = Math.max(5, Math.min(tenureCapYears, 60 - input.age));
  const n = tenureYears * 12;

  // Most you can pay monthly without breaking the safe EMI-to-income cap.
  const maxEmi = (emiToIncomeCapPct / 100) * input.income;

  // Biggest loan that EMI can service.
  const maxLoan = (maxEmi * (1 - Math.pow(1 + r, -n))) / r;

  // Two ceilings on home price: what your income can borrow, and what your
  // savings can cover as a 20% down payment.
  const loanBoundPrice = maxLoan / (1 - down);
  const savingsBoundPrice = input.savings / down;

  const affordable = Math.max(0, Math.min(loanBoundPrice, savingsBoundPrice));
  const priceMax = affordable;
  const priceMin = affordable * 0.85;

  // EMI for the affordable home.
  const emi = emiForLoan(priceMax * (1 - down), r, n);

  // Savings is the bottleneck when it can't cover 20% of the income-based budget.
  const savingsIsLimit = savingsBoundPrice < loanBoundPrice;
  const downNeeded = down * loanBoundPrice; // to unlock the full income-based budget
  const shortfall = Math.max(0, downNeeded - input.savings);

  const status: Result["status"] = savingsIsLimit ? "rent" : "ready";

  const terms: Term[] = [
    {
      term: "EMI",
      explanation:
        `Equated Monthly Installment — the fixed amount you'd pay the bank each month. ` +
        `Yours would be about ${inrFull(emi)}.`,
    },
    {
      term: "Down payment",
      explanation:
        `The upfront part of the price you pay yourself (here ${downPaymentPct}%). ` +
        `On a ${inrCompact(priceMax)} home that's about ${inrCompact(priceMax * down)}.`,
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
        `The yearly percentage the bank charges on your loan — assumed ${interestPct}% here. ` +
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
      `you can comfortably afford a home in the ${inrCompact(priceMin)}–${inrCompact(priceMax)} range, ` +
      `with an estimated EMI of about ${inrFull(emi)}/month — within a safe share of your income.`;
    nextSteps = [
      "Get a home-loan pre-approval to lock in your real budget.",
      "Keep 3–6 months of expenses as a separate emergency fund (don't spend it on the down payment).",
      "Compare interest rates from at least 3 lenders before committing.",
      "Budget ~7–10% extra for stamp duty, registration, and one-time costs.",
    ];
  } else {
    verdict =
      `Renting is the smarter move for now. You can afford up to about ${inrCompact(priceMax)} today, ` +
      `but that's limited by your savings rather than your income. Save roughly ${inrCompact(shortfall)} more ` +
      `toward your down payment and your budget could rise to around ${inrCompact(loanBoundPrice)}. ` +
      `Renting a little longer while you build that cushion puts you in a much stronger position.`;
    nextSteps = [
      `Keep renting and aim to save about ${inrCompact(shortfall)} more toward your down payment.`,
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
    assumptions: ASSUMPTIONS,
    terms,
    nextSteps,
  };
}

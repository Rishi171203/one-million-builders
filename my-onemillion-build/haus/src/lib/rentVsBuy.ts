// haus — rent-vs-buy over time.
//
// Answers: "over N years, does buying or renting-and-investing leave me richer?"
// We compare NET WORTH at the end of the horizon:
//   • Buyer: home equity (value minus remaining loan, minus selling costs).
//   • Renter: the down-payment money invested, plus each year they invest the
//     gap between the buyer's housing cost (EMI + upkeep) and their rent.
// Both pots grow at the same assumed investment return, so it's a fair fight.
//
// All assumptions are transparent and shown in the UI — they're reasonable
// global averages to refine per market before launch.

import type { Market } from "./markets";

export interface RvbAssumptions {
  appreciationPct: number; // home value growth per year
  rentGrowthPct: number; // rent increases per year
  investReturnPct: number; // return on money invested instead of tied up
  maintenancePct: number; // yearly upkeep + property tax, as % of home value
  sellingCostPct: number; // cost to sell at the end, as % of home value
}

export const DEFAULT_RVB_ASSUMPTIONS: RvbAssumptions = {
  appreciationPct: 4,
  rentGrowthPct: 5,
  investReturnPct: 8,
  maintenancePct: 1,
  sellingCostPct: 2,
};

export interface RvbPoint {
  year: number;
  buyNetWorth: number;
  rentNetWorth: number;
}

export interface RvbResult {
  ok: boolean;
  years: number;
  winner: "buy" | "rent";
  gap: number; // how much better off the winner is (absolute)
  buyNetWorth: number;
  rentNetWorth: number;
  homeValue: number;
  loanBalance: number;
  equity: number;
  totalRentPaid: number;
  series: RvbPoint[];
  assumptions: RvbAssumptions;
}

function emiForLoan(loan: number, monthlyRate: number, months: number) {
  if (loan <= 0 || months <= 0) return 0;
  const f = Math.pow(1 + monthlyRate, months);
  return (loan * monthlyRate * f) / (f - 1);
}

// Remaining loan balance after `k` monthly payments.
function loanBalanceAfter(loan: number, monthlyRate: number, emi: number, k: number) {
  if (k <= 0) return loan;
  const f = Math.pow(1 + monthlyRate, k);
  const bal = loan * f - emi * ((f - 1) / monthlyRate);
  return Math.max(0, bal);
}

export function computeRentVsBuy(
  price: number,
  monthlyRent: number,
  years: number,
  m: Market,
  tenureYears: number,
  a: RvbAssumptions = DEFAULT_RVB_ASSUMPTIONS
): RvbResult {
  const empty: RvbResult = {
    ok: false, years, winner: "rent", gap: 0, buyNetWorth: 0, rentNetWorth: 0,
    homeValue: 0, loanBalance: 0, equity: 0, totalRentPaid: 0, series: [], assumptions: a,
  };
  if (price <= 0 || years <= 0) return empty;

  const down = m.downPaymentPct / 100;
  const monthlyRate = m.interestPct / 100 / 12;
  const loanMonths = Math.max(1, Math.round(tenureYears * 12));
  const loan = price * (1 - down);
  const emiMonthly = emiForLoan(loan, monthlyRate, loanMonths);
  const downPayment = price * down;

  const appr = a.appreciationPct / 100;
  const rentG = a.rentGrowthPct / 100;
  const inv = a.investReturnPct / 100;
  const maint = a.maintenancePct / 100;
  const sell = a.sellingCostPct / 100;

  // The renter starts by investing the cash the buyer tied up as a down payment.
  let renterPot = downPayment;
  // If the buyer's housing ever costs less than rent, the buyer invests the gap.
  let buyerPot = 0;
  let totalRentPaid = 0;
  const series: RvbPoint[] = [];

  for (let y = 1; y <= years; y++) {
    const rentYear = monthlyRent * 12 * Math.pow(1 + rentG, y - 1);
    const homeValStart = price * Math.pow(1 + appr, y - 1);
    const maintYear = homeValStart * maint;

    // EMI is only paid while the loan is still running.
    const monthsThisYear = Math.min(y * 12, loanMonths) - Math.min((y - 1) * 12, loanMonths);
    const emiYear = emiMonthly * Math.max(0, monthsThisYear);

    const buyerHousing = emiYear + maintYear;
    totalRentPaid += rentYear;

    const diff = buyerHousing - rentYear;
    // Whoever spends less on housing invests the difference this year.
    renterPot = renterPot * (1 + inv) + (diff > 0 ? diff : 0);
    buyerPot = buyerPot * (1 + inv) + (diff < 0 ? -diff : 0);

    const homeValEnd = price * Math.pow(1 + appr, y);
    const loanBal = loanBalanceAfter(loan, monthlyRate, emiMonthly, Math.min(y * 12, loanMonths));
    const equity = homeValEnd - loanBal;
    const buyNetWorth = equity - homeValEnd * sell + buyerPot;
    const rentNetWorth = renterPot;

    series.push({ year: y, buyNetWorth, rentNetWorth });
  }

  const last = series[series.length - 1];
  const winner: "buy" | "rent" = last.buyNetWorth >= last.rentNetWorth ? "buy" : "rent";
  const homeValue = price * Math.pow(1 + appr, years);
  const loanBalance = loanBalanceAfter(loan, monthlyRate, emiMonthly, Math.min(years * 12, loanMonths));

  return {
    ok: true,
    years,
    winner,
    gap: Math.abs(last.buyNetWorth - last.rentNetWorth),
    buyNetWorth: last.buyNetWorth,
    rentNetWorth: last.rentNetWorth,
    homeValue,
    loanBalance,
    equity: homeValue - loanBalance,
    totalRentPaid,
    series,
    assumptions: a,
  };
}

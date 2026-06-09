// haus — per-market configuration. Values are reasonable ASSUMPTIONS to verify before launch.

export interface Market {
  code: string;
  name: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  locale: string;
  compactStyle: "indian" | "western";
  interestPct: number;
  downPaymentPct: number;
  retirementAge: number;
  emiCapPct: number;
  sample: { income: number; savings: number; rent: number; age: number };
}

export const MARKETS: Market[] = [
  {
    code: "IN", name: "India", flag: "🇮🇳",
    currencyCode: "INR", currencySymbol: "₹", locale: "en-IN", compactStyle: "indian",
    interestPct: 8.5, downPaymentPct: 20, retirementAge: 60, emiCapPct: 40,
    sample: { income: 90000, savings: 700000, rent: 28000, age: 27 },
  },
  {
    code: "US", name: "United States", flag: "🇺🇸",
    currencyCode: "USD", currencySymbol: "$", locale: "en-US", compactStyle: "western",
    interestPct: 7.0, downPaymentPct: 20, retirementAge: 65, emiCapPct: 40,
    sample: { income: 6000, savings: 30000, rent: 1800, age: 30 },
  },
  {
    code: "DE", name: "Germany", flag: "🇩🇪",
    currencyCode: "EUR", currencySymbol: "€", locale: "de-DE", compactStyle: "western",
    interestPct: 3.8, downPaymentPct: 20, retirementAge: 67, emiCapPct: 40,
    sample: { income: 4000, savings: 40000, rent: 1300, age: 30 },
  },
  {
    code: "GB", name: "United Kingdom", flag: "🇬🇧",
    currencyCode: "GBP", currencySymbol: "£", locale: "en-GB", compactStyle: "western",
    interestPct: 5.0, downPaymentPct: 15, retirementAge: 66, emiCapPct: 40,
    sample: { income: 3500, savings: 30000, rent: 1200, age: 30 },
  },
  {
    code: "AE", name: "United Arab Emirates", flag: "🇦🇪",
    currencyCode: "AED", currencySymbol: "AED ", locale: "en-AE", compactStyle: "western",
    interestPct: 4.5, downPaymentPct: 20, retirementAge: 60, emiCapPct: 40,
    sample: { income: 18000, savings: 120000, rent: 6000, age: 30 },
  },
];

export const DEFAULT_MARKET = MARKETS[0];

export function getMarket(code: string): Market {
  return MARKETS.find((m) => m.code === code) ?? DEFAULT_MARKET;
}

// ---- currency-aware formatting ----
export function fmtFull(n: number, m: Market): string {
  return m.currencySymbol + Math.round(n).toLocaleString(m.locale);
}

export function fmtCompact(n: number, m: Market): string {
  const v = Math.round(n);
  const s = m.currencySymbol;
  if (m.compactStyle === "indian") {
    if (v >= 1e7) return s + (v / 1e7).toFixed(2).replace(/\.?0+$/, "") + " Cr";
    if (v >= 1e5) return s + (v / 1e5).toFixed(1).replace(/\.0$/, "") + " L";
    return s + v.toLocaleString(m.locale);
  }
  if (v >= 1e6) return s + (v / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (v >= 1e3) return s + (v / 1e3).toFixed(0) + "K";
  return s + v.toLocaleString(m.locale);
}

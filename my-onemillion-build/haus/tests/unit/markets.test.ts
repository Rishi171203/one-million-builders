import { describe, it, expect } from "vitest";
import { MARKETS, getMarket, DEFAULT_MARKET, fmtFull, fmtCompact } from "@/lib/markets";

describe("markets", () => {
  it("has the 5 launch markets, each with sane config", () => {
    expect(MARKETS).toHaveLength(5);
    for (const m of MARKETS) {
      expect(m.code).toBeTruthy();
      expect(m.currencySymbol).toBeTruthy();
      expect(m.interestPct).toBeGreaterThan(0);
      expect(m.downPaymentPct).toBeGreaterThan(0);
      expect(m.emiCapPct).toBeGreaterThan(0);
    }
  });

  it("getMarket returns the matching market", () => {
    expect(getMarket("US").code).toBe("US");
    expect(getMarket("DE").name).toBe("Germany");
  });

  it("getMarket falls back to the default (India) for unknown/empty codes", () => {
    expect(getMarket("ZZ")).toBe(DEFAULT_MARKET);
    expect(getMarket("").code).toBe("IN");
  });

  it("fmtFull adds the currency symbol and rounds", () => {
    expect(fmtFull(1234.6, getMarket("IN"))).toBe("₹1,235");
  });

  it("fmtCompact uses Indian Cr/L styling for India", () => {
    const inr = getMarket("IN");
    expect(fmtCompact(10000000, inr)).toBe("₹1 Cr");
    expect(fmtCompact(150000, inr)).toBe("₹1.5 L");
  });

  it("fmtCompact uses western M/K styling elsewhere", () => {
    const usd = getMarket("US");
    expect(fmtCompact(1500000, usd)).toBe("$1.5M");
    expect(fmtCompact(5000, usd)).toBe("$5K");
  });
});

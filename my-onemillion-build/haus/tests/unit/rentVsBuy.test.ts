import { describe, it, expect } from "vitest";
import { computeRentVsBuy, DEFAULT_RVB_ASSUMPTIONS } from "@/lib/rentVsBuy";
import { getMarket } from "@/lib/markets";

const IN = getMarket("IN");

describe("computeRentVsBuy", () => {
  it("returns not-ok for non-positive price or years", () => {
    expect(computeRentVsBuy(0, 20000, 10, IN, 20).ok).toBe(false);
    expect(computeRentVsBuy(5000000, 20000, 0, IN, 20).ok).toBe(false);
  });

  it("produces one series point per year, with a winner and a non-negative gap", () => {
    const r = computeRentVsBuy(5000000, 20000, 7, IN, 20);
    expect(r.ok).toBe(true);
    expect(r.series).toHaveLength(7);
    expect(["buy", "rent"]).toContain(r.winner);
    expect(r.gap).toBeGreaterThanOrEqual(0);
  });

  it("is NOT rigged toward buying — extreme pro-rent assumptions flip the winner", () => {
    const proRent = { ...DEFAULT_RVB_ASSUMPTIONS, appreciationPct: 0, investReturnPct: 15, rentGrowthPct: 0 };
    const r = computeRentVsBuy(3500000, 28000, 20, IN, 20, proRent);
    expect(r.winner).toBe("rent");
  });

  it("the winner matches whichever net worth is higher at the horizon", () => {
    const r = computeRentVsBuy(5000000, 20000, 10, IN, 20);
    const expected = r.buyNetWorth >= r.rentNetWorth ? "buy" : "rent";
    expect(r.winner).toBe(expected);
  });
});

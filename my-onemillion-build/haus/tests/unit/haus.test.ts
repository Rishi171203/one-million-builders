import { describe, it, expect } from "vitest";
import { computeResult } from "@/lib/haus";
import { getMarket } from "@/lib/markets";

const IN = getMarket("IN");
const base = { income: 90000, savings: 700000, rent: 28000, age: 27, goal: "" };

describe("computeResult (core affordability)", () => {
  it("flags 'rent' when savings (not income) is the limiting factor", () => {
    const r = computeResult(base, IN);
    expect(r.status).toBe("rent");
    expect(r.priceMax).toBeGreaterThan(0);
    expect(r.priceMin).toBeCloseTo(r.priceMax * 0.85, 5);
    expect(r.shortfall).toBeGreaterThan(0);
  });

  it("flags 'ready' when the buyer has ample savings", () => {
    const r = computeResult({ ...base, income: 200000, savings: 5000000, age: 30 }, IN);
    expect(r.status).toBe("ready");
    expect(r.emi).toBeGreaterThan(0);
  });

  it("clamps loan tenure between 5 and 20 years", () => {
    expect(computeResult({ ...base, age: 25 }, IN).tenureYears).toBe(20); // 60-25=35 → cap 20
    expect(computeResult({ ...base, age: 58 }, IN).tenureYears).toBe(5); // 60-58=2 → floor 5
  });

  it("returns the 5 jargon terms and a step list", () => {
    const r = computeResult(base, IN);
    expect(r.terms).toHaveLength(5);
    expect(r.terms.map((t) => t.term)).toContain("EMI");
    expect(r.nextSteps.length).toBeGreaterThanOrEqual(3);
  });

  it("exposes the market assumptions it used", () => {
    const r = computeResult(base, IN);
    expect(r.assumptions.interestPct).toBe(8.5);
    expect(r.assumptions.downPaymentPct).toBe(20);
    expect(r.assumptions.emiCapPct).toBe(40);
  });

  it("more income never lowers the affordable price (monotonic)", () => {
    const lo = computeResult({ ...base, income: 100000, savings: 100000000, rent: 0, age: 30 }, IN);
    const hi = computeResult({ ...base, income: 300000, savings: 100000000, rent: 0, age: 30 }, IN);
    expect(hi.priceMax).toBeGreaterThan(lo.priceMax);
  });
});

import { describe, it, expect } from "vitest";
import {
  emiForLoan,
  prepayResult,
  refinanceResult,
  equityResult,
  sellVsRent,
  monthsToYrMo,
} from "@/lib/owner";

describe("owner tools", () => {
  it("emiForLoan: zero principal → 0; a real loan repays more than it borrows", () => {
    expect(emiForLoan(0, 8, 20)).toBe(0);
    const emi = emiForLoan(1000000, 8.5, 20);
    expect(emi).toBeGreaterThan(0);
    expect(emi * 240).toBeGreaterThan(1000000); // interest > 0
  });

  it("prepay saves interest and shortens the loan", () => {
    const r = prepayResult(2000000, 8.5, 20, 300000);
    expect(r.interestSaved).toBeGreaterThan(0);
    expect(r.monthsSaved).toBeGreaterThan(0);
    expect(r.monthsWith).toBeLessThan(r.monthsWithout);
  });

  it("refinancing lower saves money; higher costs money", () => {
    expect(refinanceResult(2000000, 9, 7, 20).monthlySaving).toBeGreaterThan(0);
    expect(refinanceResult(2000000, 7, 9, 20).monthlySaving).toBeLessThan(0);
  });

  it("equity: owned share and loan-to-value", () => {
    const e = equityResult(10000000, 6000000);
    expect(e.equity).toBe(4000000);
    expect(e.equityPct).toBeCloseTo(40, 5);
    expect(e.ltvPct).toBeCloseTo(60, 5);
  });

  it("equity never goes negative; LTV caps at 100% when underwater", () => {
    const e = equityResult(5000000, 8000000);
    expect(e.equity).toBe(0);
    expect(e.ltvPct).toBe(100);
  });

  it("sellVsRent verdict tracks rental yield", () => {
    expect(sellVsRent(10000000, 0, 40000).verdict).toBe("rent"); // 4.8% yield
    expect(sellVsRent(10000000, 0, 15000).verdict).toBe("sell"); // 1.8% yield
    expect(sellVsRent(10000000, 0, 25000).verdict).toBe("balanced"); // 3.0% yield
  });

  it("monthsToYrMo formats human-friendly durations", () => {
    expect(monthsToYrMo(0)).toBe("0 mo");
    expect(monthsToYrMo(15)).toBe("1 yr 3 mo");
    expect(monthsToYrMo(24)).toBe("2 yrs");
    expect(monthsToYrMo(Infinity)).toBe("—");
  });
});

// Server-side AI advice route.
//
// The "hybrid" design: our deterministic code does ALL the math (price range,
// EMI, buy-vs-rent), and Google Gemini only writes the *language* — a warm,
// plain-English verdict + next steps. The math numbers are passed into the
// prompt so the model can never invent or change them.
//
// The GEMINI_API_KEY lives only here on the server (never shipped to the
// browser). If the key is missing or the API call fails, we gracefully fall
// back to the deterministic verdict text so haus never breaks.

import { computeResult, type Inputs } from "@/lib/haus";
import { getMarket, fmtCompact, fmtFull } from "@/lib/markets";

// Free-tier Gemini model. Override with GEMINI_MODEL in .env.local if the name
// ever changes, without touching code. (gemini-2.5-flash has free quota on this
// project; gemini-2.0-flash returned free_tier limit:0.)
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `You are "haus", an unbiased, plain-language home-finance advisor for FIRST-TIME homebuyers.
Rules you must always follow:
1. Use ONLY the numbers you are given. Never invent, recompute, or change any figure.
2. No jargon. If a term is unavoidable, explain it in a few plain words.
3. Be warm, encouraging, and concise — a clear answer, never a sales pitch.
4. This is educational guidance, not financial advice. Do not promise outcomes.
5. Never mention that you are an AI, a model, or that you were given numbers.
Respond with the requested JSON only.`;

// Gemini structured-output schema → we always get { verdict, nextSteps }.
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    verdict: { type: "STRING" },
    nextSteps: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["verdict", "nextSteps"],
} as const;

function buildUserPrompt(inputs: Inputs, marketCode: string): string {
  const m = getMarket(marketCode);
  const r = computeResult(inputs, m);
  const compact = (v: number) => fmtCompact(v, m);
  const full = (v: number) => fmtFull(v, m);

  const situation = [
    `Buyer situation in ${m.name} (currency ${m.currencySymbol}):`,
    `- Monthly income: ${full(inputs.income)}`,
    `- Current savings: ${full(inputs.savings)}`,
    `- Current rent: ${full(inputs.rent)}`,
    `- Age: ${inputs.age}`,
    `- Their question/goal: "${inputs.goal}"`,
  ].join("\n");

  const calc = [
    `Our calculator (fixed assumptions: ${r.assumptions.interestPct}% annual interest, ${r.tenureYears}-year tenure, ${r.assumptions.downPaymentPct}% down payment, EMI capped at ${r.assumptions.emiCapPct}% of income) found:`,
    `- Verdict: ${r.status === "ready" ? "they can comfortably buy now" : "they should keep renting for now"}`,
    `- Affordable price range: ${compact(r.priceMin)} to ${compact(r.priceMax)}`,
    `- Estimated EMI: ${full(r.emi)} per month`,
    r.status === "rent"
      ? `- They need about ${compact(r.shortfall)} more in savings for the down payment; with that, their budget could rise to about ${compact(r.loanBoundPrice)}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `${situation}

${calc}

Write a JSON object with:
1. "verdict": 2-4 sentences explaining this verdict to them personally and warmly, referencing their actual numbers and (if relevant) answering their question.
2. "nextSteps": 3-5 short, concrete next steps tailored to whether they should buy now or keep renting.`;
}

export async function POST(request: Request) {
  let inputs: Inputs;
  let marketCode: string;
  try {
    const body = await request.json();
    inputs = body.inputs;
    marketCode = body.marketCode;
    if (!inputs || typeof inputs.income !== "number" || !marketCode) {
      return Response.json({ error: "Missing inputs or marketCode" }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Deterministic result is our source of truth + our fallback.
  const m = getMarket(marketCode);
  const fallback = computeResult(inputs, m);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // No key yet → still return a working verdict (the deterministic one).
    return Response.json({ verdict: fallback.verdict, nextSteps: fallback.nextSteps, source: "fallback" });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: buildUserPrompt(inputs, marketCode) }] }],
          generationConfig: {
            temperature: 0.85,
            // gemini-2.5-flash is a "thinking" model; thinking tokens count
            // toward the output budget. Disable thinking (budget 0) so the
            // whole budget goes to our JSON answer, and keep a roomy cap.
            thinkingConfig: { thinkingBudget: 0 },
            maxOutputTokens: 1200,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
        // Don't let a slow free-tier call hang the request forever.
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) throw new Error(`Gemini responded ${res.status}`);
    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty Gemini response");

    const parsed = JSON.parse(text) as { verdict?: string; nextSteps?: string[] };
    if (!parsed.verdict || !Array.isArray(parsed.nextSteps) || parsed.nextSteps.length === 0) {
      throw new Error("Malformed Gemini JSON");
    }

    return Response.json({ verdict: parsed.verdict, nextSteps: parsed.nextSteps, source: "ai" });
  } catch (err) {
    // Any failure (no quota, timeout, bad JSON) → silent, safe fallback.
    console.error("[/api/advice] Gemini call failed, using fallback:", err);
    return Response.json({ verdict: fallback.verdict, nextSteps: fallback.nextSteps, source: "fallback" });
  }
}

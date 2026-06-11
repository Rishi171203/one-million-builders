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
import { createClient } from "@/lib/supabase/server";

// Best-effort per-user rate limit. In-memory (resets on cold start / per
// instance) — a light guard against quota abuse, not a hard global limit.
// Swap for Upstash/Redis if we ever need a strict, multi-instance limit.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12; // requests per user per minute
const recentHits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (recentHits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    recentHits.set(key, hits);
    return true;
  }
  hits.push(now);
  recentHits.set(key, hits);
  return false;
}

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

// Gemini structured-output schema → we always get { verdict, nextSteps, terms }.
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    verdict: { type: "STRING" },
    nextSteps: { type: "ARRAY", items: { type: "STRING" } },
    terms: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { term: { type: "STRING" }, explanation: { type: "STRING" } },
        required: ["term", "explanation"],
      },
    },
  },
  required: ["verdict", "nextSteps", "terms"],
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

  const termsList = r.terms.map((t) => `- ${t.term}: ${t.explanation}`).join("\n");

  return `${situation}

${calc}

Write a JSON object with:
1. "verdict": 2-4 sentences explaining this verdict to them personally and warmly, referencing their actual numbers and (if relevant) answering their question.
2. "nextSteps": 3-5 short, concrete next steps tailored to whether they should buy now or keep renting.
3. "terms": rewrite each of these jargon explanations to be warm and crystal-clear for a first-time buyer. Keep the EXACT same "term" name for each, keep any figures already shown, and do not invent new numbers:
${termsList}`;
}

export async function POST(request: Request) {
  // Require a logged-in user — the advisor lives behind login, and this keeps
  // the endpoint from being used as a free, anonymous AI/quota drain.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Please sign in to use the advisor." }, { status: 401 });
  }
  if (isRateLimited(user.id)) {
    return Response.json({ error: "You're going a bit fast — please wait a moment and try again." }, { status: 429 });
  }

  let inputs: Inputs;
  let marketCode: string;
  try {
    const body = await request.json();
    const raw = body?.inputs;
    marketCode = typeof body?.marketCode === "string" ? body.marketCode : "";
    if (!raw || !marketCode) {
      return Response.json({ error: "Missing inputs or marketCode" }, { status: 400 });
    }
    // Validate every number (#4) — reject junk / out-of-range values instead of
    // letting them flow into the math (and the AI prompt) as NaN.
    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : NaN);
    const income = num(raw.income);
    const savings = num(raw.savings);
    const rent = num(raw.rent);
    const age = num(raw.age);
    if (!(income > 0) || !(savings >= 0) || !(rent >= 0) || !(age >= 18 && age <= 100)) {
      return Response.json({ error: "Invalid inputs" }, { status: 400 });
    }
    // Cap the free-text goal (#3): limits prompt-injection surface and payload.
    const goal = typeof raw.goal === "string" ? raw.goal.slice(0, 300) : "";
    // Normalise to exactly the known fields — drop anything else the caller sent.
    inputs = { income, savings, rent, age, goal };
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Deterministic result is our source of truth + our fallback.
  const m = getMarket(marketCode);
  const fallback = computeResult(inputs, m);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // No key yet → still return a working verdict (the deterministic one).
    return Response.json({ verdict: fallback.verdict, nextSteps: fallback.nextSteps, terms: fallback.terms, source: "fallback" });
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
            maxOutputTokens: 1500,
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

    const parsed = JSON.parse(text) as {
      verdict?: string;
      nextSteps?: string[];
      terms?: { term?: string; explanation?: string }[];
    };
    if (!parsed.verdict || !Array.isArray(parsed.nextSteps) || parsed.nextSteps.length === 0) {
      throw new Error("Malformed Gemini JSON");
    }
    // Keep only well-formed terms; fall back to the deterministic ones if none.
    const terms = Array.isArray(parsed.terms)
      ? parsed.terms.filter((t): t is { term: string; explanation: string } => !!t && typeof t.term === "string" && typeof t.explanation === "string")
      : [];

    return Response.json({
      verdict: parsed.verdict,
      nextSteps: parsed.nextSteps,
      terms: terms.length ? terms : fallback.terms,
      source: "ai",
    });
  } catch (err) {
    // Any failure (no quota, timeout, bad JSON) → silent, safe fallback.
    console.error("[/api/advice] Gemini call failed, using fallback:", err);
    return Response.json({ verdict: fallback.verdict, nextSteps: fallback.nextSteps, terms: fallback.terms, source: "fallback" });
  }
}

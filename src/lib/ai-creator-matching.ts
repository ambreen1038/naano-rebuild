import type { Creator } from "@/components/dashboard/creators/CreatorsClient";

export type MatchedCreator = {
  creatorId: string;
  reason: string;
};

export type AiMatchResult = {
  summary: string;
  matches: MatchedCreator[];
};

const MAX_CANDIDATES = 30;
const MAX_RESULTS = 8;

/**
 * Cheap, deterministic pre-rank by literal word-overlap between the query
 * and each creator's real industry_tags/headline/vertical. Not shown to
 * the user as "the" score — it only decides which real creators are worth
 * sending to the LLM at all, so the candidate list sent in the prompt
 * stays bounded as the marketplace grows.
 */
function preRank(creators: Creator[], query: string): Creator[] {
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);

  function overlapScore(c: Creator): number {
    const haystack = [
      ...c.industry_tags,
      c.headline,
      c.vertical,
      c.country ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return words.reduce((sum, w) => sum + (haystack.includes(w) ? 1 : 0), 0);
  }

  return [...creators]
    .map((c) => ({ c, score: overlapScore(c) }))
    .sort((a, b) => b.score - a.score || b.c.follower_count - a.c.follower_count)
    .slice(0, MAX_CANDIDATES)
    .map((x) => x.c);
}

export type BrandContext = {
  companyName: string;
  industry: string | null;
  productSummary: string | null;
  productFeatures: string[];
};

/**
 * The one seam for the real AI call. Returns null (never a fabricated
 * result) when no provider is configured or the call fails for any
 * reason — callers must treat null as "AI matching unavailable right
 * now", not silently return fake creators.
 */
export async function runAiCreatorMatch(
  query: string,
  brand: BrandContext,
  creators: Creator[]
): Promise<AiMatchResult | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  const candidates = preRank(creators, query);
  if (candidates.length === 0) return { summary: "No creators to match against yet.", matches: [] };

  const candidateIds = candidates.map((c) => c.id);

  const candidateLines = candidates.map((c) => {
    const fields = [
      `id: ${c.id}`,
      `name: ${c.name}`,
      `headline: ${c.headline}`,
      `industry_tags: ${c.industry_tags.join(", ") || "none"}`,
      `country: ${c.country ?? "unknown"}`,
      `follower_count: ${c.follower_count}`,
      `price_per_post: €${c.price_per_post}`,
    ];
    if (c.median_views != null) fields.push(`median_views: ${c.median_views}`);
    if (c.cpm != null) fields.push(`cpm: €${c.cpm}`);
    return `- ${fields.join(" | ")}`;
  });

  try {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        `You are helping "${brand.companyName}"${brand.industry ? ` (${brand.industry})` : ""} find LinkedIn creators to work with.`,
        brand.productSummary ? `Their product: ${brand.productSummary}` : "",
        brand.productFeatures.length
          ? `Key features: ${brand.productFeatures.join(", ")}`
          : "",
        "",
        `The brand's request: "${query}"`,
        "",
        "Below is the ONLY list of real creators you may choose from. Never",
        "invent a creator or a fact not shown here. Select up to " +
          MAX_RESULTS +
          " creators genuinely relevant to the request, ordered most to",
        "least relevant. For each, write ONE short sentence explaining why,",
        "citing only the fields shown below (their real industry tags,",
        "headline, country, or stats) — never invent numbers or claims.",
        "If none are genuinely relevant, return an empty matches list rather",
        "than forcing a match.",
        "",
        "--- CANDIDATES ---",
        ...candidateLines,
      ]
        .filter(Boolean)
        .join("\n"),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description:
                "2-3 sentences: how many creators were retained and the overall reasoning, in the brand's voice (e.g. 'I found N creators for X, ranked by relevance...').",
            },
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  creator_id: { type: Type.STRING, enum: candidateIds },
                  reason: { type: Type.STRING },
                },
                required: ["creator_id", "reason"],
              },
            },
          },
          required: ["summary", "matches"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    const parsed: unknown = JSON.parse(text);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as { summary?: unknown }).summary !== "string" ||
      !Array.isArray((parsed as { matches?: unknown }).matches)
    ) {
      return null;
    }

    const result = parsed as { summary: string; matches: unknown[] };
    const candidateIdSet = new Set(candidateIds);

    const matches: MatchedCreator[] = result.matches
      .filter(
        (m): m is { creator_id: string; reason: string } =>
          typeof m === "object" &&
          m !== null &&
          typeof (m as { creator_id?: unknown }).creator_id === "string" &&
          typeof (m as { reason?: unknown }).reason === "string" &&
          candidateIdSet.has((m as { creator_id: string }).creator_id)
      )
      .map((m) => ({ creatorId: m.creator_id, reason: m.reason }))
      .slice(0, MAX_RESULTS);

    return { summary: result.summary, matches };
  } catch (err) {
    console.error("[runAiCreatorMatch] Gemini call failed:", err);
    return null;
  }
}

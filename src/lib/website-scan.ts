const FETCH_TIMEOUT_MS = 8000;

function extractTag(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  if (!match) return null;
  const decoded = match[1]
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
  return decoded || null;
}

export type WebsiteScanResult =
  | { ok: true; title: string | null; description: string | null; bodyText: string | null }
  | { ok: false; error: string };

function extractBodyText(html: string): string | null {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const scope = bodyMatch ? bodyMatch[1] : html;
  const text = scope
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.slice(0, 4000) : null;
}

/**
 * Fetches a brand's OWN, brand-supplied website — not a scrape of a
 * third-party platform, just reading the public HTML of the URL the brand
 * itself typed in (the same trust boundary as any "auto-fill from your
 * website" onboarding step). Extracts <title>, the meta description, and a
 * plain-text excerpt of the visible body (script/style/tags stripped,
 * capped at 4000 characters) — still just this one page's own public
 * markup, no AI involved in this step.
 */
export async function scanWebsite(url: string): Promise<WebsiteScanResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: "Enter a valid website URL." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Website URL must start with http:// or https://" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NaanoBot/1.0)" },
    });

    if (!res.ok) {
      return { ok: false, error: `Website responded with ${res.status}.` };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return { ok: false, error: "That URL doesn't point to a web page." };
    }

    const html = (await res.text()).slice(0, 200_000);
    const title = extractTag(html, /<title[^>]*>([^<]*)<\/title>/i);
    const description =
      extractTag(
        html,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
      ) ??
      extractTag(
        html,
        /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i
      ) ??
      extractTag(
        html,
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i
      );

    const bodyText = extractBodyText(html);

    return { ok: true, title, description, bodyText };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "The website took too long to respond." };
    }
    return { ok: false, error: "Couldn't reach that website." };
  } finally {
    clearTimeout(timeout);
  }
}

export type GeneratedProductSummary = {
  summary: string;
  features: string[];
  differentiators: string[];
};

/**
 * The one seam for a real AI provider — Gemini (Google GenAI SDK), reading
 * GOOGLE_GENERATIVE_AI_API_KEY from the server environment only (never sent
 * to the client). Returns null (not a fabricated summary) whenever the key
 * is absent or the call fails for any reason, so a misconfigured/unreachable
 * provider degrades to the honest "not generated yet" state the rest of the
 * pipeline already handles, rather than surfacing invented content.
 */
export async function generateSummaryWithAi(
  pageText: string
): Promise<GeneratedProductSummary | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        "You are drafting a short marketplace profile for a B2B SaaS company,",
        "based only on the text below from that company's own website.",
        "Only use facts that are actually stated or clearly implied by the text —",
        "never invent numbers, customers, or claims that aren't there.",
        "",
        "--- WEBSITE TEXT ---",
        pageText.slice(0, 6000),
      ].join("\n"),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description:
                "A 2-4 sentence plain-language summary of what the product does and who it's for.",
            },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 concrete product features, each a short phrase.",
            },
            differentiators: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "3-5 short phrases on what sets this product apart from alternatives.",
            },
          },
          required: ["summary", "features", "differentiators"],
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
      !Array.isArray((parsed as { features?: unknown }).features) ||
      !Array.isArray((parsed as { differentiators?: unknown }).differentiators)
    ) {
      return null;
    }

    const result = parsed as {
      summary: string;
      features: unknown[];
      differentiators: unknown[];
    };

    return {
      summary: result.summary,
      features: result.features.filter((f): f is string => typeof f === "string"),
      differentiators: result.differentiators.filter(
        (d): d is string => typeof d === "string"
      ),
    };
  } catch (err) {
    console.error("[generateSummaryWithAi] Gemini call failed:", err);
    return null;
  }
}

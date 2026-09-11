import type { createClient } from "@/lib/supabase/server";
import { scanWebsite, generateSummaryWithAi } from "@/lib/website-scan";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Runs after a brand/space is created with a website (signup, or "create a
 * new space"), and again from Settings' "Re-scan website". Real website
 * fetch + real extraction, then a real Gemini call (see
 * generateSummaryWithAi) to draft the summary/features/differentiators. If
 * that call is ever unavailable (no key, quota, network) or malformed, this
 * still honestly records that nothing was generated rather than filling in
 * placeholder text.
 */
export async function runProductSummaryPipeline(
  supabase: SupabaseServerClient,
  brandId: string,
  website: string
): Promise<void> {
  await supabase
    .from("brands")
    .update({ product_summary_status: "pending", product_summary_error: null })
    .eq("id", brandId);

  const scan = await scanWebsite(website);

  if (!scan.ok) {
    await supabase
      .from("brands")
      .update({
        product_summary_status: "failed",
        product_summary_error: scan.error,
      })
      .eq("id", brandId);
    return;
  }

  const pageText = [scan.title, scan.description, scan.bodyText]
    .filter(Boolean)
    .join("\n\n");
  const generated = pageText ? await generateSummaryWithAi(pageText) : null;

  if (!generated) {
    // Real, honest partial result: the description line is genuinely from
    // the site's own metadata, not AI-written — everything AI would have
    // produced (summary/features/differentiators) stays empty rather than
    // guessed, with a clear reason recorded for the UI to show.
    await supabase
      .from("brands")
      .update({
        product_description: scan.description ?? null,
        product_summary_status: "failed",
        product_summary_error:
          "Couldn't generate a full product summary from your website just now. The description above was auto-filled from your website; fill in the rest below, or try Re-scan website again.",
      })
      .eq("id", brandId);
    return;
  }

  await supabase
    .from("brands")
    .update({
      product_description: scan.description ?? null,
      product_summary: generated.summary,
      product_features: generated.features,
      product_differentiators: generated.differentiators,
      product_summary_status: "ready",
      product_summary_error: null,
    })
    .eq("id", brandId);
}

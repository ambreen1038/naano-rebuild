"use server";

import { revalidatePath } from "next/cache";
import { requireBrand } from "@/lib/auth/roles";
import { runProductSummaryPipeline } from "@/lib/product-summary";

type ActionResult = { ok: true } | { ok: false; error: string };

const INDUSTRIES = [
  "sales-tech",
  "revops",
  "devtools",
  "product",
  "hr-tech",
  "fintech",
  "marketing-ops",
  "vertical-saas",
  "other",
] as const;

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;

export async function updateBrandSettings(formData: FormData): Promise<ActionResult> {
  // requireBrand() resolves the CURRENTLY ACTIVE space — this can never be
  // pointed at a different brand by a crafted request, since brand.id comes
  // from the server-resolved active_brand_id, not from the form.
  const { supabase, brand } = await requireBrand();

  const companyName = String(formData.get("company_name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const industryInput = String(formData.get("industry") ?? "other");
  const industry = (INDUSTRIES as readonly string[]).includes(industryInput)
    ? industryInput
    : "other";
  const companySizeInput = String(formData.get("company_size") ?? "");
  const companySize = (COMPANY_SIZES as readonly string[]).includes(
    companySizeInput
  )
    ? companySizeInput
    : null;
  const productDescription =
    String(formData.get("product_description") ?? "").trim() || null;
  const productSummary =
    String(formData.get("product_summary") ?? "").trim() || null;
  const productFeatures = formData
    .getAll("product_features")
    .map((f) => String(f).trim())
    .filter(Boolean);
  const productDifferentiators = formData
    .getAll("product_differentiators")
    .map((f) => String(f).trim())
    .filter(Boolean);

  if (!companyName) return { ok: false, error: "Company name is required." };
  if (website) {
    try {
      new URL(website);
    } catch {
      return { ok: false, error: "Enter a valid website URL." };
    }
  }

  const { error } = await supabase
    .from("brands")
    .update({
      company_name: companyName,
      website: website || null,
      tagline: tagline || null,
      industry,
      company_size: companySize,
      product_description: productDescription,
      product_summary: productSummary,
      product_features: productFeatures,
      product_differentiators: productDifferentiators,
    })
    .eq("id", brand.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/brand", "layout");
  return { ok: true };
}

export async function rescanWebsite(): Promise<ActionResult> {
  const { supabase, brand } = await requireBrand();

  if (!brand.website) {
    return { ok: false, error: "Add a website above first, then save." };
  }

  await runProductSummaryPipeline(supabase, brand.id, brand.website);

  revalidatePath("/brand", "layout");
  return { ok: true };
}

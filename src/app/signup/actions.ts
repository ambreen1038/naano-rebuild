"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { runProductSummaryPipeline } from "@/lib/product-summary";

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

export async function signupBrand(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const companyName = String(formData.get("company_name") ?? "");
  const industryInput = String(formData.get("industry") ?? "other");
  const industry = (INDUSTRIES as readonly string[]).includes(industryInput)
    ? industryInput
    : "other";
  const website = String(formData.get("website") ?? "").trim();

  const fail = (msg: string) =>
    redirect(`/signup/brand/email?error=${encodeURIComponent(msg)}`);

  try {
    new URL(website);
  } catch {
    fail("Enter your company website, including https://");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "brand",
        full_name: fullName,
        company_name: companyName,
        industry,
        website,
      },
    },
  });

  if (error) {
    fail(error.message);
  }

  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Check your email to confirm your account, then log in."
      )}`
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_brand_id")
    .eq("id", data.user!.id)
    .single();

  if (profile?.active_brand_id) {
    // Best-effort — a failed scan shouldn't block landing in the new space.
    await runProductSummaryPipeline(supabase, profile.active_brand_id, website);
  }

  redirect("/brand");
}

export async function signupCreator(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "creator",
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(
      `/signup/creator/email?error=${encodeURIComponent(error.message)}`
    );
  }

  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Check your email to confirm your account, then log in."
      )}`
    );
  }

  redirect("/creator/onboarding/linkedin");
}

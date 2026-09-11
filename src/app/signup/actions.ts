"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const companyName = String(formData.get("company_name") ?? "");
  const industryInput = String(formData.get("industry") ?? "other");
  const industry = (INDUSTRIES as readonly string[]).includes(industryInput)
    ? industryInput
    : "other";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName,
        industry,
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Check your email to confirm your account, then log in."
      )}`
    );
  }

  redirect("/dashboard");
}

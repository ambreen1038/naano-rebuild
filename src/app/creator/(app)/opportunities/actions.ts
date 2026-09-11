"use server";

import { createClient } from "@/lib/supabase/server";
import { COUNTRIES } from "@/lib/countries";

type ActionResult = { ok: true } | { ok: false; error: string };

async function currentCreator() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null as null, creatorId: null };

  const { data: creator } = await supabase
    .from("creators")
    .select("id, billing_setup_completed_at")
    .eq("user_id", user.id)
    .single();

  return { supabase, user, creatorId: creator?.id ?? null, creator };
}

/** Saves the one-time professional/billing profile that gates applying. */
export async function saveCreatorBillingProfile(
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user, creator } = await currentCreator();
  if (!user || !creator) return { ok: false, error: "Not signed in." };

  const registrationCountry = String(
    formData.get("registration_country") ?? ""
  ).trim();
  const hasRegisteredBusiness = formData.get("has_registered_business") === "yes";
  const legalName = String(formData.get("legal_name") ?? "").trim();
  const legalAddress = String(formData.get("legal_address") ?? "").trim();
  const taxAck = formData.get("tax_ack") === "on";
  const invoiceAck = formData.get("invoice_ack") === "on";
  const legalCapacityAck = formData.get("legal_capacity_ack") === "on";

  if (!(COUNTRIES as readonly string[]).includes(registrationCountry)) {
    return { ok: false, error: "Select a registration country." };
  }
  if (!legalName) return { ok: false, error: "Enter your legal name." };
  if (!legalAddress) return { ok: false, error: "Enter your billing address." };
  if (!taxAck || !invoiceAck || !legalCapacityAck) {
    return { ok: false, error: "Confirm all three statements to continue." };
  }

  const { error } = await supabase
    .from("creators")
    .update({
      registration_country: registrationCountry,
      has_registered_business: hasRegisteredBusiness,
      legal_name: legalName,
      legal_address: legalAddress,
      billing_setup_completed_at:
        creator.billing_setup_completed_at ?? new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Applies the current creator to a campaign. Idempotent. */
export async function applyToCampaign(
  campaignId: string
): Promise<ActionResult> {
  const { supabase, user, creatorId } = await currentCreator();
  if (!user || !creatorId) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("campaign_applications")
    .insert({ campaign_id: campaignId, creator_id: creatorId });

  if (error) {
    // Unique violation = already applied — treat as success, not an error.
    if (error.code === "23505") return { ok: true };
    if (error.code === "42501") {
      return {
        ok: false,
        error: "Complete your professional setup before applying.",
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

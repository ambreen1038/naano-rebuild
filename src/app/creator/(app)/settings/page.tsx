import { requireCreator } from "@/lib/auth/roles";
import { CreatorSettingsClient } from "@/components/dashboard/creator-settings/CreatorSettingsClient";
import { CREATOR_SETTINGS_TABS } from "@/lib/creator-settings-tabs";

export default async function CreatorSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab = (CREATOR_SETTINGS_TABS as readonly string[]).includes(tab ?? "")
    ? (tab as (typeof CREATOR_SETTINGS_TABS)[number])
    : "Profile";

  const { supabase, user } = await requireCreator();

  const { data: creator } = await supabase
    .from("creators")
    .select(
      "id, name, linkedin_url, twitter_url, industry_tags, linkedin_refreshed_at, registration_country, has_registered_business, legal_name, legal_address, bank_account_holder, bank_iban, bank_name"
    )
    .eq("user_id", user.id)
    .single();

  if (!creator) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500">
          Your marketplace card hasn&apos;t been created yet.
        </p>
      </div>
    );
  }

  return <CreatorSettingsClient initialTab={initialTab} creator={creator} />;
}

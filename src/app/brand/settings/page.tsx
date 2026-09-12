import { headers } from "next/headers";
import { requireBrand } from "@/lib/auth/roles";
import { SettingsClient } from "@/components/dashboard/settings/SettingsClient";
import { SETTINGS_TABS } from "@/lib/settings-tabs";
import { brandIdToSiteKey } from "@/lib/site-key";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab = (SETTINGS_TABS as readonly string[]).includes(tab ?? "")
    ? (tab as (typeof SETTINGS_TABS)[number])
    : "Profile";

  const { supabase, brand } = await requireBrand();

  const { data: fullBrand } = await supabase
    .from("brands")
    .select(
      "id, company_name, website, tagline, industry, company_size, product_description, product_summary, product_features, product_differentiators, product_summary_status, product_summary_error"
    )
    .eq("id", brand.id)
    .single();

  if (!fullBrand) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500">
          Your space could not be loaded.
        </p>
      </div>
    );
  }

  const hdrs = await headers();
  const host = hdrs.get("host") ?? "";
  const proto =
    hdrs.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : "";

  const { count: eventCount } = await supabase
    .from("site_events")
    .select("id", { count: "exact", head: true });

  const { data: recentEvents } = await supabase
    .from("site_events")
    .select("id, event_type, booking_id, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <SettingsClient
      brand={fullBrand}
      initialTab={initialTab}
      integrations={{
        origin,
        siteKey: brandIdToSiteKey(brand.id),
        installed: (eventCount ?? 0) > 0,
        recentEvents: recentEvents ?? [],
      }}
    />
  );
}

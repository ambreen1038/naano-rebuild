import { requireBrand } from "@/lib/auth/roles";
import { SettingsClient } from "@/components/dashboard/settings/SettingsClient";

export default async function SettingsPage() {
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

  return <SettingsClient brand={fullBrand} />;
}

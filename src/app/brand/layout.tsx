import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { PortalShell } from "@/components/dashboard/PortalShell";
import { requireBrand } from "@/lib/auth/roles";
import { getLaunchPlanStatus } from "@/lib/launch-plan";

export default async function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirects signed-out users to /login and creators to /creator, and
  // resolves which brand/space is currently active.
  const { supabase, user, brand } = await requireBrand();

  // RLS ("brands: members can view") already scopes this to only the
  // spaces this user belongs to — no explicit membership join needed.
  const { data: brands } = await supabase
    .from("brands")
    .select("id, company_name")
    .order("created_at", { ascending: true });

  const companyName = brand.company_name || user.email || "Your company";
  const launchPlan = await getLaunchPlanStatus(
    supabase,
    brand.marketplace_explored_at
  );

  return (
    <PortalShell
      sidebar={
        <Sidebar
          brands={brands ?? []}
          activeBrandId={brand.id}
          activeCompanyName={companyName}
        />
      }
      topbar={
        <Topbar
          companyName={companyName}
          email={user.email ?? ""}
          walletBalance={Number(brand.wallet_balance ?? 0)}
          settingsHref="/brand/settings"
          walletHref="/brand/billing"
          creatorsHref="/brand/creators"
          launchPlan={launchPlan}
        />
      }
    >
      {children}
    </PortalShell>
  );
}

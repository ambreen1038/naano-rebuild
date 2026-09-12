import { redirect } from "next/navigation";
import { requireCreator, onboardingRouteFor } from "@/lib/auth/roles";
import { CreatorSidebar } from "@/components/dashboard/CreatorSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { PortalShell } from "@/components/dashboard/PortalShell";

// Gated creator shell. The onboarding routes deliberately sit OUTSIDE this
// route group, so an in-progress creator can be redirected here without
// bouncing between this gate and the step they're being sent to.
export default async function CreatorAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user, profile, onboarding } = await requireCreator();

  const resumeRoute = onboardingRouteFor(onboarding);
  if (resumeRoute) redirect(resumeRoute);

  const [{ data: creator }, { data: walletRow }] = await Promise.all([
    supabase
      .from("creators")
      .select("name, avatar_url")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single(),
  ]);

  const displayName =
    creator?.name ?? onboarding?.linkedin_name ?? profile?.full_name ?? "Creator";

  return (
    <PortalShell
      sidebar={<CreatorSidebar />}
      topbar={
        <Topbar
          companyName={displayName}
          email={user.email ?? ""}
          walletBalance={Number(walletRow?.wallet_balance ?? 0)}
          avatarUrl={creator?.avatar_url}
          showGrowthPills={false}
          walletHref="/creator/earnings"
          settingsHref="/creator/settings"
          integrationsHref="/creator/integrations"
          tourHref="/creator/tour"
        />
      }
    >
      {children}
    </PortalShell>
  );
}

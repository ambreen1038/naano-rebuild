import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_name, wallet_balance")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("[dashboard] profile query failed:", profileError.message);
  }

  const companyName = profile?.company_name ?? user.email ?? "Your company";

  return (
    <div className="flex flex-1">
      <Sidebar companyName={companyName} />
      <div className="flex flex-1 flex-col">
        <Topbar
          companyName={companyName}
          email={user.email ?? ""}
          walletBalance={Number(profile?.wallet_balance ?? 0)}
        />
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}

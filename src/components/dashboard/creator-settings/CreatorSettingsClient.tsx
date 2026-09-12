"use client";

import Link from "next/link";
import { CREATOR_SETTINGS_TABS, type CreatorSettingsTab } from "@/lib/creator-settings-tabs";
import { ProfileTab } from "./ProfileTab";
import { PaymentsTab } from "./PaymentsTab";
import { AccountTab } from "./AccountTab";

export type CreatorSettingsData = {
  id: string;
  name: string;
  linkedin_url: string | null;
  twitter_url: string | null;
  industry_tags: string[];
  linkedin_refreshed_at: string | null;
  registration_country: string | null;
  has_registered_business: boolean | null;
  legal_name: string | null;
  legal_address: string | null;
  bank_account_holder: string | null;
  bank_iban: string | null;
  bank_name: string | null;
};

export function CreatorSettingsClient({
  initialTab,
  creator,
}: {
  initialTab: CreatorSettingsTab;
  creator: CreatorSettingsData;
}) {
  // Driven by the URL (?tab=), same reasoning as the Brand Portal's
  // Settings page — direct links, refresh, and back/forward all land on
  // the right tab without any client-side tab state to fall out of sync.
  const tab = initialTab;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Settings
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage your profile and payment details.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        <div className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {CREATOR_SETTINGS_TABS.map((t) => (
            <Link
              key={t}
              href={t === "Profile" ? "/creator/settings" : `/creator/settings?tab=${t}`}
              className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium ${
                tab === t
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          {tab === "Profile" && <ProfileTab creator={creator} />}
          {tab === "Payments" && <PaymentsTab creator={creator} />}
          {tab === "Account" && <AccountTab />}
        </div>
      </div>
    </div>
  );
}

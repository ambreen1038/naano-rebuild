"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Landmark, Loader2 } from "lucide-react";
import {
  ProfessionalSetupForm,
} from "@/components/dashboard/opportunities/ProfessionalSetupForm";
import { saveBankDetails } from "@/app/creator/(app)/settings/actions";
import type { CreatorSettingsData } from "./CreatorSettingsClient";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

function BankDetailsForm({
  creator,
  onSaved,
}: {
  creator: CreatorSettingsData;
  onSaved: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const result = await saveBankDetails(formData);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved();
  }

  return (
    <form action={handleSubmit} className="mt-3 flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Account holder name
        <input
          name="bank_account_holder"
          required
          defaultValue={creator.bank_account_holder ?? ""}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        IBAN
        <input
          name="bank_iban"
          required
          defaultValue={creator.bank_iban ?? ""}
          placeholder="e.g. FR76 3000 6000 0112 3456 7890 189"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Bank name
        <input
          name="bank_name"
          required
          defaultValue={creator.bank_name ?? ""}
          className={inputClass}
        />
      </label>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 self-start rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Save bank details
      </button>
    </form>
  );
}

export function PaymentsTab({ creator }: { creator: CreatorSettingsData }) {
  const router = useRouter();
  const [billingOpen, setBillingOpen] = useState(true);
  const [editingBank, setEditingBank] = useState(false);

  const hasBankDetails = Boolean(creator.bank_iban);

  function maskIban(iban: string) {
    return iban.length > 4 ? `${"•".repeat(iban.length - 4)}${iban.slice(-4)}` : iban;
  }

  return (
    <div>
      <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
        Company and billing
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Complete your billing details to receive payments.
      </p>

      <details
        open={billingOpen}
        onToggle={(e) => setBillingOpen((e.target as HTMLDetailsElement).open)}
        className="mt-4"
      >
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-blue-600 [&::-webkit-details-marker]:hidden">
          <ChevronDown
            className={`h-4 w-4 transition-transform ${billingOpen ? "rotate-180" : ""}`}
          />
          Edit billing details
        </summary>
        <div className="mt-3">
          <ProfessionalSetupForm
            defaults={{
              registrationCountry: creator.registration_country,
              hasRegisteredBusiness: creator.has_registered_business,
              legalName: creator.legal_name,
              legalAddress: creator.legal_address,
            }}
            submitLabel="Save my information"
            onSaved={() => router.refresh()}
          />
        </div>
      </details>

      <div className="my-6 border-t border-zinc-100 dark:border-zinc-900" />

      <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
        Bank details
      </h2>
      <p className="mt-1 text-sm text-zinc-500">Your saved payout details.</p>

      {editingBank ? (
        <BankDetailsForm
          creator={creator}
          onSaved={() => {
            setEditingBank(false);
            router.refresh();
          }}
        />
      ) : (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Landmark className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {hasBankDetails ? creator.bank_name : "No bank details saved"}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {hasBankDetails
                ? `${creator.bank_account_holder} · ${maskIban(creator.bank_iban!)}`
                : "Add your details to receive bank transfers."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingBank(true)}
            className="shrink-0 rounded-full border border-zinc-300 px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

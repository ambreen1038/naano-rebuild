"use client";

import { useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { saveCreatorBillingProfile } from "@/app/creator/(app)/opportunities/actions";

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export type ProfessionalSetupDefaults = {
  registrationCountry: string | null;
  hasRegisteredBusiness: boolean | null;
  legalName: string | null;
  legalAddress: string | null;
};

/**
 * The legal/billing fields shared by two contexts: the Opportunities
 * apply-gate modal (ProfessionalSetupModal, first-time completion) and the
 * Settings > Payments tab (editing afterward). Both call the same
 * saveCreatorBillingProfile action — one field set, one save path, just
 * different surrounding chrome.
 */
export function ProfessionalSetupForm({
  defaults,
  onSaved,
  submitLabel = "Save my information",
}: {
  defaults: ProfessionalSetupDefaults;
  onSaved: () => void;
  submitLabel?: string;
}) {
  const [hasBusiness, setHasBusiness] = useState<"yes" | "no">(
    defaults.hasRegisteredBusiness ? "yes" : "no"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const result = await saveCreatorBillingProfile(formData);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved();
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            Registration country
            <select
              name="registration_country"
              required
              defaultValue={defaults.registrationCountry ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Select a country
              </option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            Do you have a registered business?
            <div className="grid grid-cols-2 gap-2">
              {(["yes", "no"] as const).map((v) => (
                <label
                  key={v}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                    hasBusiness === v
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="has_registered_business"
                    value={v}
                    checked={hasBusiness === v}
                    onChange={() => setHasBusiness(v)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  {v === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            Legal name
            <input
              name="legal_name"
              required
              defaultValue={defaults.legalName ?? ""}
              placeholder="Full name or company name"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            Legal address
            <input
              name="legal_address"
              required
              defaultValue={defaults.legalAddress ?? ""}
              placeholder="Full billing address"
              className={inputClass}
            />
          </label>

          <label className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-zinc-700 dark:border-amber-900 dark:bg-amber-950 dark:text-zinc-300">
            <input
              type="checkbox"
              name="tax_ack"
              required
              className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
            />
            I confirm that I am solely responsible for declaring and
            paying taxes on this income to the tax authorities in my
            country.
          </label>

          <label className="flex items-start gap-2.5 rounded-lg border border-zinc-200 p-3 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
            <input
              type="checkbox"
              name="invoice_ack"
              required
              className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
            />
            I authorize Naano to issue invoices in my name and on my
            behalf for services delivered through the platform.
          </label>

          <label className="flex items-start gap-2.5 rounded-lg border border-zinc-200 p-3 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
            <input
              type="checkbox"
              name="legal_capacity_ack"
              required
              className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
            />
            I certify that I am legally allowed to provide paid services
            in my country and that the information provided here is
            complete and accurate.
          </label>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

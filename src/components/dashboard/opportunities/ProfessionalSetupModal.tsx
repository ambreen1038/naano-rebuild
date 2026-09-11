"use client";

import { useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { saveCreatorBillingProfile } from "@/app/creator/(app)/opportunities/actions";

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export function ProfessionalSetupModal({
  defaultCountry,
  onClose,
  onSaved,
}: {
  defaultCountry: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [hasBusiness, setHasBusiness] = useState<"yes" | "no">("no");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Complete your professional setup
        </h2>
        <p className="mt-1.5 text-sm text-zinc-500">
          Complete your legal and billing details before paid collaborations.
          A registered business is not required outside the European Union.
          This unlocks applying and accepting Bookings.
        </p>

        <form action={handleSubmit} className="mt-5 flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Professional and billing information
          </p>

          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                Registration country
                <select
                  name="registration_country"
                  required
                  defaultValue={defaultCountry ?? ""}
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
                  placeholder="Full name or company name"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                Legal address
                <input
                  name="legal_address"
                  required
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
            {submitting ? "Saving…" : "Save my information"}
          </button>
        </form>
      </div>
    </div>
  );
}

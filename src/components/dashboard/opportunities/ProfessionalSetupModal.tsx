"use client";

import { ProfessionalSetupForm } from "./ProfessionalSetupForm";

export function ProfessionalSetupModal({
  defaultCountry,
  onClose,
  onSaved,
}: {
  defaultCountry: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
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

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Professional and billing information
        </p>

        <div className="mt-4">
          <ProfessionalSetupForm
            defaults={{
              registrationCountry: defaultCountry,
              hasRegisteredBusiness: null,
              legalName: null,
              legalAddress: null,
            }}
            onSaved={onSaved}
          />
        </div>
      </div>
    </div>
  );
}

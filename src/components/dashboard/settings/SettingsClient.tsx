"use client";

import { useState } from "react";
import { ChevronDown, Fingerprint, Loader2, X } from "lucide-react";
import { updateBrandSettings, rescanWebsite } from "@/app/dashboard/settings/actions";

const INDUSTRIES: { value: string; label: string }[] = [
  { value: "sales-tech", label: "Sales Tech" },
  { value: "revops", label: "RevOps" },
  { value: "devtools", label: "DevTools" },
  { value: "product", label: "Product" },
  { value: "hr-tech", label: "HR Tech" },
  { value: "fintech", label: "Fintech" },
  { value: "marketing-ops", label: "Marketing" },
  { value: "vertical-saas", label: "SaaS" },
  { value: "other", label: "Other" },
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;

const SETTINGS_TABS = ["Profile", "Audience", "Team & access", "Integrations"] as const;
type SettingsTab = (typeof SETTINGS_TABS)[number];

export type BrandSettings = {
  id: string;
  company_name: string;
  website: string | null;
  tagline: string | null;
  industry: string | null;
  company_size: string | null;
  product_description: string | null;
  product_summary: string | null;
  product_features: string[];
  product_differentiators: string[];
  product_summary_status: "none" | "pending" | "ready" | "failed";
  product_summary_error: string | null;
};

function ChipListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </p>
        <span className="text-xs text-zinc-400">{items.length} selected</span>
      </div>
      <div className="mt-2 flex flex-col gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="flex items-start justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-950 dark:bg-blue-950 dark:text-blue-300"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="shrink-0 text-blue-400 hover:text-blue-700 dark:hover:text-blue-200"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="w-full min-w-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-lg border border-zinc-300 px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export function SettingsClient({ brand }: { brand: BrandSettings }) {
  const [tab, setTab] = useState<SettingsTab>("Profile");
  const [industry, setIndustry] = useState(brand.industry ?? "other");
  const [editingIndustry, setEditingIndustry] = useState(false);
  const [companySize, setCompanySize] = useState(brand.company_size);
  const [features, setFeatures] = useState(brand.product_features);
  const [differentiators, setDifferentiators] = useState(
    brand.product_differentiators
  );
  const [productDetailsOpen, setProductDetailsOpen] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [rescanning, setRescanning] = useState(false);
  const [rescanError, setRescanError] = useState<string | null>(null);

  const industryLabel =
    INDUSTRIES.find((i) => i.value === industry)?.label ?? "Other";

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    setSaved(false);
    formData.set("industry", industry);
    if (companySize) formData.set("company_size", companySize);
    features.forEach((f) => formData.append("product_features", f));
    differentiators.forEach((d) => formData.append("product_differentiators", d));

    const result = await updateBrandSettings(formData);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleRescan() {
    setRescanning(true);
    setRescanError(null);
    const result = await rescanWebsite();
    setRescanning(false);
    if (!result.ok) setRescanError(result.error);
  }

  return (
    <div className="p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
        Naano workspace
      </p>
      <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Settings
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage your company profile and the audience you want to reach.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        <div className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {SETTINGS_TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium ${
                tab === t
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab !== "Profile" ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500 dark:border-zinc-800">
            {tab} isn&apos;t built yet.
          </div>
        ) : (
          <form
            action={handleSubmit}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Fingerprint className="h-4 w-4" />
              </span>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Identity
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                Company name
                <input
                  name="company_name"
                  required
                  defaultValue={brand.company_name}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                Website
                <input
                  type="url"
                  name="website"
                  defaultValue={brand.website ?? ""}
                  placeholder="https://yourcompany.com"
                  className={inputClass}
                />
              </label>
            </div>
            <label className="mt-4 flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Tagline
              <input
                name="tagline"
                defaultValue={brand.tagline ?? ""}
                placeholder="A one-line description of what you do"
                className={inputClass}
              />
            </label>

            <div className="my-6 border-t border-zinc-100 dark:border-zinc-900" />

            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Sector &amp; size
            </h3>

            <div className="mt-3">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Your industry
              </p>
              <input type="hidden" name="industry" value={industry} />
              {editingIndustry ? (
                <select
                  autoFocus
                  value={industry}
                  onChange={(e) => {
                    setIndustry(e.target.value);
                    setEditingIndustry(false);
                  }}
                  onBlur={() => setEditingIndustry(false)}
                  className={`mt-2 ${inputClass} max-w-xs`}
                >
                  {INDUSTRIES.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    {industryLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingIndustry(true)}
                    className="rounded-full border border-dashed border-zinc-300 px-3 py-1 text-sm font-medium text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Company size
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {COMPANY_SIZES.map((size) => (
                  <label
                    key={size}
                    className={`cursor-pointer rounded-lg border px-3.5 py-2 text-sm font-medium ${
                      companySize === size
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="company_size"
                      value={size}
                      checked={companySize === size}
                      onChange={() => setCompanySize(size)}
                      className="sr-only"
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            <div className="my-6 border-t border-zinc-100 dark:border-zinc-900" />

            <p className="text-sm text-zinc-500">
              Review the information imported from your website.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {brand.product_summary_status === "pending" && (
                <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Scanning your website…
                </span>
              )}
              {brand.product_summary_status === "ready" && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  Product summary generated from your website — review it below, then save.
                </span>
              )}
              <button
                type="button"
                disabled
                title="Coming soon — no logo upload storage is wired up yet"
                className="cursor-not-allowed rounded-full border border-zinc-200 px-3.5 py-1.5 text-sm font-medium text-zinc-400 dark:border-zinc-800"
              >
                Change logo
              </button>
              <button
                type="button"
                onClick={handleRescan}
                disabled={rescanning || !brand.website}
                className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300"
              >
                {rescanning && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Re-scan website
              </button>
            </div>
            {rescanError && (
              <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                {rescanError}
              </p>
            )}

            <div className="my-6 border-t border-zinc-100 dark:border-zinc-900" />

            <button
              type="button"
              onClick={() => setProductDetailsOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-600"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  productDetailsOpen ? "rotate-180" : ""
                }`}
              />
              Product details
            </button>

            {productDetailsOpen && (
              <div className="mt-4 flex flex-col gap-4">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  Product story
                </h3>

                {brand.product_summary_status === "failed" &&
                  brand.product_summary_error && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {brand.product_summary_error}
                    </p>
                  )}

                <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                  Description
                  <textarea
                    name="product_description"
                    rows={3}
                    defaultValue={brand.product_description ?? ""}
                    placeholder="A short description of your product"
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                  Product summary
                  <textarea
                    name="product_summary"
                    rows={4}
                    defaultValue={brand.product_summary ?? ""}
                    placeholder="What your product does, for whom, and why it matters"
                    className={inputClass}
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ChipListEditor
                    label="Product features"
                    items={features}
                    onChange={setFeatures}
                    placeholder="e.g. AI outbound sequences"
                  />
                  <ChipListEditor
                    label="Differentiators"
                    items={differentiators}
                    onChange={setDifferentiators}
                    placeholder="e.g. Multichannel sequences in one inbox"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            )}
            {saved && (
              <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Settings saved.
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

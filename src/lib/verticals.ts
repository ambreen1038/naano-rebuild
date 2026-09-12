// Shared between "use server" action files and client components. A
// "use server" file's exports are only safe to import from client code
// when they're functions (treated as callable RPC references) — a plain
// array export like this one breaks at runtime when a client component
// imports it directly from a "use server" module (the same class of bug
// fixed for SETTINGS_TABS in src/lib/settings-tabs.ts), so it lives here
// instead.
export const VERTICALS = [
  "sales-tech",
  "revops",
  "devtools",
  "product",
  "hr-tech",
  "fintech",
  "marketing-ops",
  "vertical-saas",
] as const;

export const VERTICAL_LABELS: Record<(typeof VERTICALS)[number], string> = {
  "sales-tech": "Sales tech",
  revops: "RevOps",
  devtools: "Devtools",
  product: "Product",
  "hr-tech": "HR tech",
  fintech: "Fintech",
  "marketing-ops": "Marketing ops",
  "vertical-saas": "Vertical SaaS",
};

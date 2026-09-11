// profiles.industry and campaigns.target_vertical use the signup vocabulary;
// creators.industry_tags (the marketplace filter tags) use a separate,
// richer tag list. This bridges the two.
export const INDUSTRY_TO_TAG: Record<string, string> = {
  "sales-tech": "Sales",
  revops: "RevOps",
  devtools: "DevTools",
  product: "Product",
  "hr-tech": "HR",
  fintech: "Fintech",
  "marketing-ops": "Marketing",
  "vertical-saas": "SaaS",
};

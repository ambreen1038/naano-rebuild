// The "site key" shown in Settings -> Integrations is just the brand's own
// id, reformatted as `nn_<32 hex chars>` (no dashes) so it reads like a
// typical analytics write key. Deterministic both ways, so there's no
// separate column to generate or keep in sync.
export function brandIdToSiteKey(brandId: string): string {
  return `nn_${brandId.replace(/-/g, "")}`;
}

export function siteKeyToBrandId(siteKey: string): string | null {
  const hex = siteKey.startsWith("nn_") ? siteKey.slice(3) : siteKey;
  if (!/^[0-9a-f]{32}$/i.test(hex)) return null;
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

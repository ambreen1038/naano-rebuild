const TAG_COLORS = [
  "bg-emerald-50 text-emerald-700",
  "bg-violet-50 text-violet-700",
  "bg-blue-50 text-blue-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-teal-50 text-teal-700",
];

export function tagColor(tag: string) {
  const sum = tag.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return TAG_COLORS[sum % TAG_COLORS.length];
}

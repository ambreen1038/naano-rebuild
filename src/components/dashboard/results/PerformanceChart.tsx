export function PerformanceChart({
  series,
}: {
  series: { date: string; count: number }[];
}) {
  const width = 600;
  const height = 160;
  const max = Math.max(...series.map((s) => s.count), 1);
  const stepX = series.length > 1 ? width / (series.length - 1) : width;

  const points = series
    .map((s, i) => {
      const x = i * stepX;
      const y = height - (s.count / max) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  const first = series[0]?.date;
  const mid = series[Math.floor(series.length / 2)]?.date;
  const last = series[series.length - 1]?.date;
  const fmt = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric" })
      : "";

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-40 w-full"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={0}
            x2={width}
            y1={height * f}
            y2={height * f}
            stroke="currentColor"
            className="text-zinc-100 dark:text-zinc-800"
            strokeWidth={1}
          />
        ))}
        <polyline points={points} fill="none" stroke="#2563eb" strokeWidth={2} />
      </svg>
      <div className="mt-1 flex justify-between text-xs text-zinc-400">
        <span>{fmt(first)}</span>
        <span>{fmt(mid)}</span>
        <span>{fmt(last)}</span>
      </div>
    </div>
  );
}

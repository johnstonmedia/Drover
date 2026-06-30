// Small up/down/flat indicator. Shows "—" when there's no movement data, so we
// never imply a trend we don't actually have.
export default function Trend({
  change,
  changePct,
  className = '',
}: {
  change?: number;
  changePct?: number;
  className?: string;
}) {
  if (change == null && changePct == null) {
    return <span className={`text-drover-sage ${className}`}>—</span>;
  }
  const v = change ?? changePct ?? 0;
  const up = v > 0;
  const down = v < 0;
  const color = up ? 'text-green-600' : down ? 'text-red-600' : 'text-drover-sage';
  const arrow = up ? '▲' : down ? '▼' : '–';
  const label =
    changePct != null
      ? `${Math.abs(changePct).toFixed(1)}%`
      : Math.abs(change ?? 0).toLocaleString('en-AU');
  return (
    <span className={`inline-flex items-center gap-1 tabular-nums ${color} ${className}`}>
      <span aria-hidden>{arrow}</span>
      {label}
    </span>
  );
}

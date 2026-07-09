import "./dashboard-panels.css";

/** Tarjeta de estadística (KPI) para los paneles de control por rol. */
export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <article className="stat-tile">
      <p className="stat-tile__label">{label}</p>
      <p className="stat-tile__value">{value}</p>
      {hint && <p className="stat-tile__hint">{hint}</p>}
    </article>
  );
}

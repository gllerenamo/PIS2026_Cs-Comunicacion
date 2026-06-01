/** Logotipo del SSP: marca con isotipo + nombre del sistema. */
export function Logo({
  size = "md",
  variant = "dark",
}: {
  size?: "sm" | "md";
  variant?: "dark" | "light";
}) {
  const color = variant === "light" ? "#ffffff" : "var(--color-primary)";
  const sub = variant === "light" ? "rgba(255,255,255,.8)" : "var(--color-text-muted)";
  const iconSize = size === "sm" ? 28 : 36;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="10" fill={color} />
        <path
          d="M13 20.5l4.5 4.5L27 15.5"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <strong style={{ color, fontSize: size === "sm" ? 16 : 18 }}>SSP</strong>
        <span style={{ color: sub, fontSize: size === "sm" ? 10 : 11 }}>
          Seguimiento de Practicantes
        </span>
      </span>
    </span>
  );
}

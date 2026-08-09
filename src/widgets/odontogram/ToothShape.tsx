const TOOTH_PATH =
  "M12 3c-2.1 0-3.2 1.1-4.5 1.1C5.8 4.1 4 3.3 4 6.2c0 2.4.9 3.2 1.1 5.7.2 2.6.9 8.6 2.8 8.6 1.6 0 1.5-3.5 2-5.3.3-1.2.6-2 2.1-2s1.8.8 2.1 2c.5 1.8.4 5.3 2 5.3 1.9 0 2.6-6 2.8-8.6.2-2.5 1.1-3.3 1.1-5.7 0-2.9-1.8-2.1-3.5-2.1C15.2 4.1 14.1 3 12 3Z"

/** Outlined tooth glyph used as a clickable odontogram cell — the stroke is
 * colored by status, with a soft neon-style glow (double drop-shadow in the
 * same color) around teeth that have an active diagnosis, matching the
 * reference design. Healthy teeth stay a plain, glow-free gray outline. */
export function ToothShape({
  color,
  glow,
  selected,
  className,
}: {
  color: string
  glow?: boolean
  selected?: boolean
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth={selected ? 2.75 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={
        glow
          ? { filter: `drop-shadow(0 0 2px ${color}b3) drop-shadow(0 0 6px ${color}80)` }
          : undefined
      }
    >
      <path d={TOOTH_PATH} />
    </svg>
  )
}

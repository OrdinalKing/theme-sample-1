/**
 * The little safe drawn on the accounts wall and in the history header.
 * `size` sets an explicit pixel size; otherwise CSS (via className) sizes it.
 * `hinges` adds the two hinge marks used on the accounts wall.
 */
export default function SafeIcon({ locked = false, size, className, hinges = false }) {
  const strong = locked ? '#55646F' : '#D9A441';
  const soft = locked ? '#3A4854' : '#7A5E27';
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      aria-hidden="true"
      style={size ? { width: size, height: size } : undefined}
    >
      <rect
        x="7"
        y="11"
        width="106"
        height="98"
        rx="11"
        fill="#0E1620"
        stroke="#2C3A47"
        strokeWidth="2"
      />
      <rect
        x="15"
        y="19"
        width="90"
        height="82"
        rx="7"
        fill="#16202B"
        stroke={soft}
        strokeWidth="1.6"
      />
      <g className="dial">
        <circle cx="60" cy="60" r="22" fill="none" stroke={strong} strokeWidth="2" />
        <circle cx="60" cy="60" r="14" fill="none" stroke={soft} strokeWidth="1.4" />
        <circle cx="60" cy="60" r="4.5" fill={strong} />
        <path
          d="M60 38v-7M60 89v-7M38 60h-7M89 60h-7M45 45l-5-5M75 75l5 5M75 45l5-5M45 75l-5 5"
          stroke={strong}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <path d="M99 52v16" stroke={strong} strokeWidth="3" strokeLinecap="round" />
      {hinges && (
        <path d="M21 26v8M21 86v8" stroke="#2C3A47" strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
}

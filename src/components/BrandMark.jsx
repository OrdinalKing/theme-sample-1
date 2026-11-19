export default function BrandMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect
        x="2.5"
        y="2.5"
        width="27"
        height="27"
        rx="6"
        fill="none"
        stroke="#D9A441"
        strokeWidth="1.6"
      />
      <circle cx="16" cy="16" r="7.5" fill="none" stroke="#D9A441" strokeWidth="1.6" />
      <path
        d="M16 5.5v4M16 22.5v4M5.5 16h4M22.5 16h4"
        stroke="#D9A441"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

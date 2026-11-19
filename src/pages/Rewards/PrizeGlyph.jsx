const PATHS = {
  points: (
    <path
      d="M12 4l2.17 5.51 5.91.36-4.56 3.77 1.48 5.74L12 16.2l-5 3.18 1.48-5.74-4.56-3.77 5.91-.36z"
      strokeLinejoin="round"
    />
  ),
  cash: (
    <>
      <rect x="3" y="6.5" width="18" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6.5 9.5h.01M17.5 14.5h.01" strokeLinecap="round" strokeWidth="2.2" />
    </>
  ),
  boost: (
    <>
      <path d="M4 16.5l5-5 3.5 3.5L19 8.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 8.5H19V13" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  spin: (
    <>
      <path d="M19 12a7 7 0 11-2.05-4.95" strokeLinecap="round" />
      <path d="M19 4.5V8h-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  mult: <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" strokeLinecap="round" />,
};

/** Line icon for a prize kind: points, cash, boost, spin or mult. */
export default function PrizeGlyph({ kind, className = '' }) {
  return (
    <svg className={`glyph ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {PATHS[kind] || PATHS.points}
    </svg>
  );
}

const ICONS = {
  wheel: (
    <>
      <circle cx="12" cy="13" r="8.5" />
      <path d="M12 4.5v17M3.5 13h17M6 7l12 12M18 7L6 19" strokeWidth="1.1" />
      <path d="M10 2h4l-2 3z" fill="currentColor" stroke="none" />
    </>
  ),
  needle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 12l4.5-6" strokeLinecap="round" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </>
  ),
  double: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" strokeWidth="1.1" />
    </>
  ),
  dial: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.2" />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.5 1.5M16.5 16.5L18 18M18 6l-1.5 1.5M7.5 16.5L6 18"
        strokeLinecap="round"
      />
    </>
  ),
  slots: (
    <>
      <rect x="2.5" y="5" width="5.5" height="14" rx="1.5" />
      <rect x="9.25" y="5" width="5.5" height="14" rx="1.5" />
      <rect x="16" y="5" width="5.5" height="14" rx="1.5" />
      <path d="M1.5 12h21" strokeWidth="1.1" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="9.5" y="3" width="5" height="5" rx="1" />
      <rect x="16" y="3" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="3" y="9.5" width="5" height="5" rx="1" />
      <rect x="16" y="9.5" width="5" height="5" rx="1" />
      <rect x="3" y="16" width="5" height="5" rx="1" />
      <rect x="9.5" y="16" width="5" height="5" rx="1" />
      <rect x="16" y="16" width="5" height="5" rx="1" />
    </>
  ),
  ticker: (
    <>
      <rect x="1.5" y="7" width="5" height="10" rx="1.2" />
      <rect x="9.5" y="7" width="5" height="10" rx="1.2" />
      <rect x="17.5" y="7" width="5" height="10" rx="1.2" />
      <path d="M12 3v18" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  coin: (
    <>
      <ellipse cx="12" cy="12" rx="6.5" ry="9" />
      <ellipse cx="12" cy="12" rx="3.5" ry="5.5" />
      <path d="M18.5 12c0 5-2.9 9-6.5 9" strokeWidth="2.4" strokeOpacity=".45" />
    </>
  ),
};

export default function VariantIcon({ id }) {
  return (
    <svg className="variant-icon" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[id]}
    </svg>
  );
}

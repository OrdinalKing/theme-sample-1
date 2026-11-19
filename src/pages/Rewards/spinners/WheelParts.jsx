import BrandMark from '../../../components/BrandMark.jsx';

/** Brass teardrop pointer fixed at 12 o'clock over a wheel (same -200..200 box). */
export function WheelPointer({ children }) {
  return (
    <svg
      className="wheel-overlay"
      viewBox="-200 -200 400 400"
      overflow="visible"
      aria-hidden="true"
    >
      <path className="pointer" d="M0 -158L-12 -189A13 13 0 1 1 12 -189Z" />
      <circle className="pointer-pin" cx="0" cy="-194" r="4" />
      {children}
    </svg>
  );
}

/** The fixed centre cap with the Aurum mark. */
export function WheelHub({ size = '21%' }) {
  return (
    <div className="wheel-hub" style={{ width: size }} aria-hidden="true">
      <BrandMark />
    </div>
  );
}

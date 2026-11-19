/**
 * The right-hand stage: the vault door SVG plus the sensor "windows"
 * (face, fingerprint pad, handshake code, engraving) and the caption.
 * Purely presentational; every moving part is driven by the `ui` prop.
 */

export const ARC_LEN = 1194;
const PAD_RING_LEN = 575;

/* ---------- static geometry (built once, reused every render) ---------- */

const BOLTS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * 45 * Math.PI) / 180;
  return {
    i,
    bx: 300 + Math.cos(a) * 246,
    by: 300 + Math.sin(a) * 246,
    dx: Math.cos(a) * 26,
    dy: Math.sin(a) * 26,
  };
});

const TICKS = (
  <g>
    {Array.from({ length: 72 }, (_, i) => {
      const a = (i * 5 * Math.PI) / 180;
      const big = i % 9 === 0;
      const inner = big ? 212 : 220;
      return (
        <line
          key={i}
          x1={300 + Math.cos(a) * 230}
          y1={300 + Math.sin(a) * 230}
          x2={300 + Math.cos(a) * inner}
          y2={300 + Math.sin(a) * inner}
          stroke={big ? '#7A5E27' : '#2B3A47'}
          strokeWidth={big ? 2.4 : 1.2}
        />
      );
    })}
  </g>
);

const SPOKES = (
  <g>
    {Array.from({ length: 4 }, (_, i) => {
      const a = ((i * 90 + 45) * Math.PI) / 180;
      return (
        <path
          key={i}
          d={`M${300 + Math.cos(a) * 178} ${300 + Math.sin(a) * 178}L${300 + Math.cos(a) * 204} ${
            300 + Math.sin(a) * 204
          }`}
          stroke="#D9A441"
          strokeWidth="4"
          strokeLinecap="round"
          opacity=".55"
        />
      );
    })}
  </g>
);

const FACE_POINTS = [
  [115, 64],
  [88, 92],
  [142, 92],
  [76, 120],
  [154, 120],
  [95, 104],
  [135, 104],
  [115, 120],
  [115, 142],
  [99, 158],
  [131, 158],
  [115, 168],
  [84, 178],
  [146, 178],
  [115, 196],
  [96, 206],
  [134, 206],
];
const FACE_LINKS = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [1, 5],
  [2, 6],
  [5, 7],
  [6, 7],
  [7, 8],
  [8, 9],
  [8, 10],
  [9, 11],
  [10, 11],
  [3, 12],
  [4, 13],
  [12, 15],
  [13, 16],
  [11, 14],
  [14, 15],
  [14, 16],
  [9, 12],
  [10, 13],
];
const MESH_CHILDREN = (
  <>
    {FACE_LINKS.map(([a, b], i) => (
      <line
        key={`l${i}`}
        x1={FACE_POINTS[a][0]}
        y1={FACE_POINTS[a][1]}
        x2={FACE_POINTS[b][0]}
        y2={FACE_POINTS[b][1]}
        style={{ transitionDelay: `${i * 22}ms` }}
      />
    ))}
    {FACE_POINTS.map(([cx, cy], i) => (
      <circle key={`c${i}`} cx={cx} cy={cy} r="2.2" style={{ transitionDelay: `${i * 34}ms` }} />
    ))}
  </>
);
const ANGLE_DOTS = [
  [95, 236],
  [115, 236],
  [135, 236],
];

const RIDGES = [
  'M52 8c-22 0-38 17-38 38 0 22-2 34-8 48',
  'M52 8c22 0 38 17 38 38 0 22 2 34 8 48',
  'M52 24c-14 0-23 10-23 23 0 24-3 38-9 50',
  'M52 24c14 0 23 10 23 23 0 24 3 38 9 50',
  'M52 40c-6 0-9 4-9 10 0 26-2 44-7 58',
  'M52 40c6 0 9 4 9 10 0 26 2 44 7 58',
  'M52 58v50',
];
const RIDGE_PATHS = RIDGES.map((d) => <path key={d} d={d} />);
const MINUTIAE = [
  [30, 52],
  [74, 52],
  [41, 86],
  [63, 86],
  [52, 34],
  [22, 74],
  [82, 74],
  [52, 104],
];

const cls = (...names) => names.filter(Boolean).join(' ');

/* ---------- component ---------- */

export default function VaultStage({
  ui,
  engraveName,
  plateRef,
  engraveRef,
  printLitRef,
  padRingRef,
  padHandlers,
}) {
  const winProps = (id) => ({
    className: cls('win', ui.win === id && 'act'),
    hidden: ui.win !== id,
  });

  return (
    <section className="stage">
      <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
        <svg
          className={cls('door', ui.spinning && 'spinning')}
          viewBox="0 0 600 600"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="plateG" cx="38%" cy="30%">
              <stop offset="0" stopColor="#1E2A36" />
              <stop offset="1" stopColor="#0A1016" />
            </radialGradient>
            <linearGradient id="rimG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3A4A58" />
              <stop offset=".5" stopColor="#141D26" />
              <stop offset="1" stopColor="#33424F" />
            </linearGradient>
            <filter id="soft">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>

          <circle
            cx="300"
            cy="300"
            r="250"
            fill="#D9A441"
            filter="url(#soft)"
            style={{
              opacity: ui.spillOn ? 0.22 : 0,
              transition: ui.spillOn ? 'opacity 1s' : undefined,
            }}
          />
          <circle cx="300" cy="300" r="286" fill="none" stroke="#161F29" strokeWidth="16" />
          <circle cx="300" cy="300" r="286" fill="none" stroke="url(#rimG)" strokeWidth="3" />

          <g>
            {BOLTS.map((b) => (
              <g
                key={b.i}
                className="bolt"
                style={
                  ui.doorOpen
                    ? {
                        transform: `translate(${b.dx}px,${b.dy}px)`,
                        transitionDelay: `${b.i * 55}ms`,
                      }
                    : undefined
                }
              >
                <rect
                  x={b.bx - 9}
                  y={b.by - 9}
                  width="18"
                  height="18"
                  rx="4"
                  fill="#1A242F"
                  stroke="#42525F"
                  strokeWidth="1.5"
                  transform={`rotate(${b.i * 45} ${b.bx} ${b.by})`}
                />
              </g>
            ))}
          </g>

          <g ref={plateRef} style={{ transformOrigin: '42px 300px' }}>
            <circle
              cx="300"
              cy="300"
              r="258"
              fill="url(#plateG)"
              stroke="#2B3A47"
              strokeWidth="2"
            />
            <circle cx="300" cy="300" r="238" fill="none" stroke="#1A242F" strokeWidth="1.5" />
            <g
              className="dialring"
              style={{
                transformOrigin: '300px 300px',
                transform: ui.doorOpen ? 'rotate(288deg)' : undefined,
              }}
            >
              {TICKS}
              <circle cx="300" cy="300" r="206" fill="none" stroke="#223040" strokeWidth="1" />
              {SPOKES}
            </g>
            <circle
              cx="300"
              cy="300"
              r="190"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={ARC_LEN}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '300px 300px',
                transition: 'stroke-dashoffset .6s ease,stroke .4s',
                stroke: ui.arcColor,
                strokeDashoffset: ARC_LEN * (1 - ui.arcP),
              }}
            />
            <circle cx="300" cy="300" r="172" fill="#070B10" stroke="#2B3A47" strokeWidth="2" />
            <circle cx="300" cy="300" r="160" fill="none" stroke="#16202B" strokeWidth="1" />
            <g
              stroke={ui.brackets}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              style={{ transition: 'stroke .4s' }}
            >
              <path d="M206 252v-24a10 10 0 0110-10h24" />
              <path d="M394 252v-24a10 10 0 00-10-10h-24" />
              <path d="M206 348v24a10 10 0 0010 10h24" />
              <path d="M394 348v24a10 10 0 01-10 10h-24" />
            </g>
          </g>
        </svg>

        {/* ---- face ---- */}
        <div {...winProps('face')}>
          <svg width="230" height="250" viewBox="0 0 230 250" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="beamG" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#63E6D2" stopOpacity="0" />
                <stop offset=".5" stopColor="#63E6D2" stopOpacity=".5" />
                <stop offset="1" stopColor="#63E6D2" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g
              stroke={ui.outline}
              fill="none"
              strokeWidth="1.3"
              style={{ transition: 'stroke .5s' }}
            >
              <path d="M115 32c-31 0-49 21-49 50 0 11 1 18 3 26 5 19 22 45 46 45s41-26 46-45c2-8 3-15 3-26 0-29-18-50-49-50z" />
              <path d="M85 100c6-4 15-4 21 0M124 100c6-4 15-4 21 0" />
              <path d="M115 108v23c0 4-4 6-8 6M99 150c10 6 22 6 32 0" />
              <path d="M101 186v19c0 11-17 15-31 20M129 186v19c0 11 17 15 31 20" />
            </g>
            <g className={cls('mesh', ui.meshLit && 'lit', ui.meshDone && 'done')}>
              {MESH_CHILDREN}
            </g>
            <rect
              className={cls('beam', ui.beamOn && 'on')}
              x="18"
              y="112"
              width="194"
              height="26"
              fill="url(#beamG)"
              rx="4"
            />
            <g>
              {ANGLE_DOTS.map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill={i < ui.angleDots ? '#D9A441' : '#2A3743'}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* ---- fingerprint pad ---- */}
        <div {...winProps('print')}>
          <div
            className={cls('pad', ui.padState === 'hold' && 'hold', ui.padState === 'ok' && 'ok')}
            role="button"
            tabIndex={0}
            aria-label="Hold to read your fingerprint"
            {...padHandlers}
          >
            <svg style={{ position: 'absolute', inset: -1 }} viewBox="0 0 186 186">
              <circle
                ref={padRingRef}
                cx="93"
                cy="93"
                r="91.5"
                fill="none"
                stroke={ui.padRingStroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={PAD_RING_LEN}
                strokeDashoffset={PAD_RING_LEN}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '93px 93px' }}
              />
            </svg>
            <svg className="print" viewBox="0 0 104 118">
              {RIDGE_PATHS}
            </svg>
            <svg ref={printLitRef} className="print lit" viewBox="0 0 104 118">
              {RIDGE_PATHS}
            </svg>
            <svg className="minu" viewBox="0 0 104 118">
              {MINUTIAE.map(([x, y], i) => (
                <rect
                  key={i}
                  className={ui.minuLit ? 'on' : undefined}
                  x={x - 4}
                  y={y - 4}
                  width="8"
                  height="8"
                  transform={`rotate(45 ${x} ${y})`}
                  style={ui.minuLit ? { transitionDelay: `${i * 80}ms` } : undefined}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* ---- handshake code ---- */}
        <div {...winProps('code')}>
          <div className="code">
            {ui.code.map((digit, i) => (
              <b key={i} className={i < ui.codeSet ? 'set' : undefined}>
                {digit}
              </b>
            ))}
          </div>
        </div>

        {/* ---- engraving ---- */}
        <div {...winProps('engrave')}>
          <div className="engrave" ref={engraveRef}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v10M8.5 9.5h7M8.5 14.5h7" />
            </svg>
            <p>This vault will be cast for</p>
            <h4>{engraveName || 'a purpose you choose'}</h4>
          </div>
        </div>

        <div className="caption">
          <h3>{ui.capTitle}</h3>
          <p>{ui.capText}</p>
        </div>
      </div>
    </section>
  );
}

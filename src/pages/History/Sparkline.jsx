export default function Sparkline({ values }) {
  const w = 100;
  const h = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pt = (v, i) => [(i / (values.length - 1)) * w, h - ((v - min) / span) * h];
  const line = values
    .map((v, i) => {
      const [x, y] = pt(v, i);
      return (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
    })
    .join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const [lx, ly] = pt(values[values.length - 1], values.length - 1);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#D9A441" stopOpacity=".30" />
          <stop offset="1" stopColor="#D9A441" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#trendFill)" />
      <path
        d={line}
        fill="none"
        stroke="#D9A441"
        strokeWidth="1.1"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={lx.toFixed(2)}
        cy={ly.toFixed(2)}
        r="1.6"
        fill="#63E6D2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

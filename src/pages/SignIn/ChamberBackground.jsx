import { useEffect, useRef } from 'react';

/** The slowly rotating chamber drawn behind the sign-in page. Dots take the current accent colour. */
export default function ChamberBackground({ accent }) {
  const canvasRef = useRef(null);
  const accentRef = useRef(accent);

  useEffect(() => {
    accentRef.current = accent;
  }, [accent]);

  useEffect(() => {
    const c = canvasRef.current;
    const x = c.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dots = Array.from({ length: 84 }, () => ({
      a: Math.random() * 6.28,
      r: Math.random(),
      s: 0.0005 + Math.random() * 0.0013,
      z: Math.random(),
    }));
    let w, h, d;
    let t = 0;
    let raf = 0;

    const size = () => {
      d = Math.min(window.devicePixelRatio || 1, 2);
      w = c.width = window.innerWidth * d;
      h = c.height = window.innerHeight * d;
      c.style.width = window.innerWidth + 'px';
      c.style.height = window.innerHeight + 'px';
    };
    size();
    window.addEventListener('resize', size);

    const frame = () => {
      if (!reduced) t++;
      x.clearRect(0, 0, w, h);
      const cx = w * 0.63;
      const cy = h * 0.48;
      const R = Math.max(w, h) * 0.62;
      const col = accentRef.current || '#63E6D2';

      for (let i = 1; i <= 7; i++) {
        x.beginPath();
        x.arc(cx, cy, (R * i) / 9, 0, 6.283);
        x.strokeStyle = 'rgba(120,150,170,' + (0.052 - i * 0.005) + ')';
        x.lineWidth = d;
        x.stroke();
      }

      x.save();
      x.translate(cx, cy);
      x.rotate(t * 0.0007);
      for (let i = 0; i < 48; i++) {
        x.beginPath();
        x.moveTo(R * 0.17, 0);
        x.lineTo(R * 0.95, 0);
        x.strokeStyle = 'rgba(130,160,180,' + (i % 6 === 0 ? 0.05 : 0.016) + ')';
        x.lineWidth = d;
        x.stroke();
        x.rotate(6.283 / 48);
      }
      x.restore();

      dots.forEach((dt) => {
        if (!reduced) {
          dt.r -= dt.s;
          if (dt.r < 0.05) {
            dt.r = 1;
            dt.a = Math.random() * 6.28;
          }
        }
        const px = cx + Math.cos(dt.a + t * 0.0004) * R * dt.r;
        const py = cy + Math.sin(dt.a + t * 0.0004) * R * dt.r * 0.92;
        x.beginPath();
        x.arc(px, py, (1.3 + dt.z * 1.5) * d, 0, 6.283);
        x.globalAlpha = 0.1 + dt.z * 0.3;
        x.fillStyle = col;
        x.fill();
        x.globalAlpha = 1;
      });

      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
    };
  }, []);

  return <canvas ref={canvasRef} className="bg" aria-hidden="true" />;
}

import { useMemo } from 'react';

const seed = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;

const SIZES = ['2px', '2.5px', '3px'];
const COLORS = [
  'rgba(13,148,136,0.7)',
  'rgba(124,58,237,0.6)',
  'rgba(13,148,136,0.45)',
  'rgba(255,255,255,0.5)',
];

export default function StarBackground() {
  const dots = useMemo(() => Array.from({ length: 120 }, (_, i) => ({
    left: `${seed(i * 3 + 1) * 100}%`,
    top: `${seed(i * 7 + 2) * 100}%`,
    width: SIZES[i % 3],
    height: SIZES[i % 3],
    background: COLORS[i % 4],
    animationDelay: `${seed(i * 11 + 5) * 5}s`,
  })), []);

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {dots.map((style, i) => (
        <span key={i} className="star-dot" style={style} />
      ))}
    </div>
  );
}

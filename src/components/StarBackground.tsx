import { useMemo } from 'react';

export default function StarBackground() {
  const dots = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    left: `${(i * 37 + i * i * 13) % 100}%`,
    top: `${(i * 53 + i * 7) % 100}%`,
    background: i % 3 === 0
      ? 'rgba(13,148,136,0.5)'
      : i % 3 === 1
      ? 'rgba(124,58,237,0.4)'
      : 'rgba(13,148,136,0.3)',
    animationDelay: `${(i * 0.3) % 4}s`,
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

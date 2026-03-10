import { useEffect, useRef, useState } from 'react';
import './KPICard.css';

interface KPICardProps {
  label: string;
  /** Static string — used when rawValue is not provided */
  value?: string;
  /** Numeric value to count up from 0 on mount */
  rawValue?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export default function KPICard({
  label,
  value,
  rawValue,
  prefix = '',
  suffix = '',
  decimals = 0,
}: KPICardProps) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);
  const startedRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rawValue === undefined) return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const duration = 1200;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
            setDisplay(eased * rawValue);
            if (t < 1) frameRef.current = requestAnimationFrame(tick);
          };
          frameRef.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [rawValue]);

  const formatted =
    rawValue !== undefined
      ? decimals > 0
        ? display.toFixed(decimals)
        : Math.round(display).toLocaleString()
      : null;

  return (
    <div ref={ref} className="kpi-card">
      <span className="kpi-card__value">
        {formatted !== null ? `${prefix}${formatted}${suffix}` : value}
      </span>
      <span className="kpi-card__label">{label}</span>
    </div>
  );
}

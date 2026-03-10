import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import './StatsBar.css';

interface Stat {
  raw: number;
  prefix?: string;
  suffix?: string;
  label: string;
  decimals?: number;
}

const STATS: Stat[] = [
  { raw: 2400,  suffix: '+',  label: 'Plans Generated' },
  { raw: 3,                   label: 'Goal Modes' },
  { raw: 98,    suffix: '%',  label: 'Optimal Solutions' },
  { raw: 14.2,  prefix: '+', suffix: '%', label: 'Avg. Efficiency Gain', decimals: 1 },
];

function CountUp({ stat, run }: { stat: Stat; run: boolean }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!run) return;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(eased * stat.raw);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [run, stat.raw]);

  const formatted = stat.decimals
    ? display.toFixed(stat.decimals)
    : Math.round(display).toLocaleString();

  return (
    <span className="stats-bar__value">
      {stat.prefix ?? ''}{formatted}{stat.suffix ?? ''}
    </span>
  );
}

export default function StatsBar() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      className="stats-bar"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      <div className="stats-bar__inner">
        {STATS.map((stat) => (
          <div key={stat.label} className="stats-bar__item">
            <CountUp stat={stat} run={inView} />
            <span className="stats-bar__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

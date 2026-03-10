import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import './RoadmapTimeline.css';

interface EntryDef {
  label: string;
  title: string;
  body: string;
  labelColor: 'teal' | 'purple';
  dotActive: boolean;
  pills: { text: string; variant: 'teal' | 'purple-outline' }[];
}

const ENTRIES: EntryDef[] = [
  {
    label: 'TODAY',
    title: 'Core Optimisation',
    body: 'Our Gurobi LP solver builds your personalised meal plan and workout schedule from scratch. Every meal is costed, every session fits your available days and equipment. Three goal modes: Weight Loss, Muscle Gain, and Body Recomposition.',
    labelColor: 'teal',
    dotActive: true,
    pills: [
      { text: '✓ Meal planning',        variant: 'teal' },
      { text: '✓ Workout scheduling',   variant: 'teal' },
      { text: '✓ 3 goal modes',         variant: 'teal' },
    ],
  },
  {
    label: 'PHASE 2',
    title: 'Wearable Sync',
    body: 'Connect Fitbit or Apple Watch to feed real calorie burn back into the model. Your plan re-optimises automatically when your actual activity differs from the schedule.',
    labelColor: 'purple',
    dotActive: false,
    pills: [
      { text: 'Apple Watch integration', variant: 'purple-outline' },
      { text: 'Garmin integration',      variant: 'purple-outline' },
      { text: 'Whoop integration',       variant: 'purple-outline' },
    ],
  },
  {
    label: 'PHASE 3',
    title: 'AI Coach',
    body: 'Missed a session? Hit a plateau? The model detects deviations and re-runs the optimiser to get you back on track without losing your timeline. Adaptive, not prescriptive.',
    labelColor: 'teal',
    dotActive: false,
    pills: [
      { text: 'Plateau detection', variant: 'teal' },
      { text: 'Auto-replanning',   variant: 'teal' },
    ],
  },
  {
    label: 'PHASE 4',
    title: 'Community',
    body: 'Share goals with friends, compete on leaderboards, and join group challenges. The model accounts for social accountability as a soft constraint — people who share goals are 2× more likely to hit them.',
    labelColor: 'purple',
    dotActive: false,
    pills: [
      { text: 'Leaderboards',      variant: 'purple-outline' },
      { text: 'Group challenges',  variant: 'purple-outline' },
    ],
  },
];

/* ── Single phase entry with IntersectionObserver reveal ── */
interface PhaseEntryProps {
  entry: EntryDef;
  dotThreshold: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}

function PhaseEntry({ entry, dotThreshold, scrollYProgress }: PhaseEntryProps) {
  const { label, title, body, labelColor, pills } = entry;
  const entryRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = entryRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -80px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Dot opacity for inactive dots driven by scroll (kept from original) */
  const dotOpacity = useTransform(
    scrollYProgress,
    [dotThreshold, Math.min(dotThreshold + 0.02, 1)],
    [0.35, 1],
  );

  const colorClass = labelColor === 'teal' ? 'phase-entry--teal' : 'phase-entry--purple';

  return (
    <motion.div
      ref={entryRef}
      className={`roadmap__entry ${colorClass}${active ? ' phase-entry--active' : ''}`}
      data-color={labelColor}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="roadmap__dot"
        style={active ? undefined : { opacity: dotOpacity as unknown as number }}
      />

      <div className="roadmap__body">
        <span className={`roadmap__phase roadmap__phase--${labelColor}`}>{label}</span>
        <h3 className="roadmap__entry-title">{title}</h3>
        <p className="roadmap__entry-desc">{body}</p>
        {pills.length > 0 && (
          <div className="roadmap__pills">
            {pills.map(({ text, variant }) => (
              <span
                key={text}
                className={`roadmap__pill roadmap__pill--${variant}`}
              >
                {text}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main component ── */
export default function RoadmapTimeline() {
  const entriesRef = useRef<HTMLDivElement>(null);
  const spineRef   = useRef<HTMLDivElement>(null);

  const [dotOffsets, setDotOffsets] = useState<number[]>([]);
  const [totalHeight, setTotalHeight] = useState(0);

  const measure = useCallback(() => {
    const container = entriesRef.current;
    const spine     = spineRef.current;
    if (!container || !spine) return;

    const containerTop = container.getBoundingClientRect().top + window.scrollY;
    const spineHeight  = spine.offsetHeight;

    const dots = container.querySelectorAll<HTMLElement>('.roadmap__dot');
    const offsets = Array.from(dots).map((dot) => {
      const dotTop = dot.getBoundingClientRect().top + window.scrollY;
      return dotTop - containerTop + dot.offsetHeight / 2;
    });

    setDotOffsets(offsets);
    setTotalHeight(spineHeight);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    if (entriesRef.current) ro.observe(entriesRef.current);
    return () => { cancelAnimationFrame(id); ro.disconnect(); };
  }, [measure]);

  const { scrollYProgress } = useScroll({
    target: entriesRef,
    offset: ['start center', 'end center'],
  });

  const fillHeight  = useTransform(scrollYProgress, [0, 1], [0, totalHeight]);
  const fillOpacity = useTransform(scrollYProgress, [0, 0.04], [0, 1]);

  const dotThresholds = dotOffsets.map((offset) =>
    totalHeight > 0 ? offset / totalHeight : 0,
  );

  return (
    <section className="roadmap" id="roadmap">
      <div className="roadmap__inner">
        <div className="roadmap__header">
          <p className="roadmap__label">Roadmap</p>
          <h2 className="roadmap__title">Built to Grow With You</h2>
          <p className="roadmap__subtitle">OptiFit is just getting started.</p>
        </div>

        <div className="roadmap__track">
          {/* Spine */}
          <div className="roadmap__spine" ref={spineRef} aria-hidden="true">
            <div className="roadmap__spine-bg" />
            <motion.div
              className="roadmap__spine-fill"
              style={{ height: fillHeight, opacity: fillOpacity }}
            />
          </div>

          {/* Entries */}
          <div className="roadmap__entries" ref={entriesRef}>
            {ENTRIES.map((entry, i) => (
              <PhaseEntry
                key={entry.label}
                entry={entry}
                dotThreshold={dotThresholds[i] ?? 0}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Target } from 'lucide-react';
import { fadeUp, cardStagger, cardChild } from '../../tokens/variants';
import { COLOR_TEAL, COLOR_PURPLE, COLOR_TEXT_MUTED } from '../../tokens/chartColors';
import './BentoGrid.css';

/* ─────────────────────────────────────────────
   CARD VISUALS — one component per card area
───────────────────────────────────────────── */

/* 1. CALORIE TARGETS — zap icon + 3 pill bars */
function CalorieVisual({ hovered }: { hovered: boolean }) {
  const bars = [
    { label: 'Deficit',     active: false },
    { label: 'Maintenance', active: true  },
    { label: 'Surplus',     active: false },
  ];
  return (
    <div className="bv bv--calories">
      <Zap
        size={56}
        color={hovered ? COLOR_PURPLE : COLOR_TEAL}
        strokeWidth={1.5}
        style={{ transition: 'color 0.3s ease', opacity: hovered ? 1 : 0.75 }}
      />
      <div className="bv__pill-bars">
        {bars.map(({ label, active }) => (
          <div key={label} className={`bv__pill-bar${active && hovered ? ' bv__pill-bar--active' : active ? ' bv__pill-bar--on' : ''}`}>
            <span className="bv__pill-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 2. PROVEN BY MATH — bar chart with teal→purple gradient bars */
function ProvenVisual({ hovered }: { hovered: boolean }) {
  const HEIGHTS = [38, 52, 44, 68, 58, 80, 72];
  const maxIdx = HEIGHTS.indexOf(Math.max(...HEIGHTS));
  return (
    <div className="bv bv--proven">
      <div className="bv__bars">
        {HEIGHTS.map((h, i) => (
          <div key={i} className="bv__bar-wrap" style={{ height: `${h}%` }}>
            <motion.div
              className={`bv__bar${i === maxIdx ? ' bv__bar--peak' : ''}`}
              animate={{ opacity: hovered ? 1 : 0.55 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            />
          </div>
        ))}
      </div>
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="bv__optimal-label"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
          >
            Optimal ✓
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* 3. MACRO BALANCE — donut ring SVG */
const DONUT_R = 46;
const DONUT_C = 2 * Math.PI * DONUT_R; // ~289
const SEGMENTS = [
  { label: 'Protein', pct: 0.35, color: COLOR_TEAL,   offset: 0 },
  { label: 'Carbs',   pct: 0.45, color: COLOR_PURPLE, offset: 0.35 },
  { label: 'Fat',     pct: 0.20, color: COLOR_TEXT_MUTED, offset: 0.80 },
];

function MacroVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className="bv bv--macro">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={DONUT_R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="16" />
        {SEGMENTS.map(({ label, pct, color, offset }) => {
          const dash = DONUT_C * pct;
          const gap  = DONUT_C - dash;
          const rot  = offset * 360 - 90;
          return (
            <motion.circle
              key={label}
              cx="60" cy="60" r={DONUT_R}
              fill="none"
              stroke={color}
              strokeWidth={hovered ? 18 : 14}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(${rot} 60 60)`}
              style={{ transition: 'stroke-width 0.3s ease' }}
            />
          );
        })}
        <text x="60" y="56" textAnchor="middle" fill={COLOR_TEXT_MUTED} fontSize="10" fontFamily="var(--font-mono)" opacity="0.8">macro</text>
        <text x="60" y="70" textAnchor="middle" fill={COLOR_TEXT_MUTED} fontSize="11" fontFamily="var(--font-mono)" fontWeight="600">balance</text>
      </svg>
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="bv__macro-labels"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span style={{ color: COLOR_TEAL }}>Protein 35%</span>
            <span style={{ color: COLOR_PURPLE }}>Carbs 45%</span>
            <span style={{ color: COLOR_TEXT_MUTED }}>Fat 20%</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* 4. YOUR SCHEDULE — 3×7 mini calendar grid */
const CAL_DAYS   = ['M','T','W','T','F','S','S'];

// 3 weeks of data: week 0 same pattern, week 1 shifted, week 2 same as week 0
const CAL_ROWS = [
  [true,  false, true,  false, true,  false, false],
  [false, true,  false, true,  false, true,  false],
  [true,  false, true,  false, true,  false, false],
];
const TODAY_ROW = 1;
const TODAY_COL = 3;

function ScheduleVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className="bv bv--schedule">
      {/* Day headers */}
      <div className="bv__cal-header">
        {CAL_DAYS.map((d, i) => (
          <span key={i} className="bv__cal-label">{d}</span>
        ))}
      </div>
      {/* 3 rows × 7 columns */}
      <div className="bv__cal-grid">
        {CAL_ROWS.map((row, ri) =>
          row.map((active, ci) => {
            const isToday = ri === TODAY_ROW && ci === TODAY_COL;
            const waveDelay = hovered ? (ri * 7 + ci) * 0.04 : 0;
            return (
              <motion.div
                key={`${ri}-${ci}`}
                className={`bv__cal-cell${active ? ' bv__cal-cell--on' : ''}${isToday ? ' bv__cal-cell--today' : ''}`}
                animate={hovered ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                transition={{ duration: 0.4, delay: waveDelay, ease: 'easeInOut' }}
              />
            );
          })
        )}
      </div>
      {/* Stat pills */}
      <div className="bv__cal-pills">
        <span className="bv__cal-pill bv__cal-pill--teal">3 active days</span>
        <span className="bv__cal-pill bv__cal-pill--purple">1 hr sessions</span>
      </div>
    </div>
  );
}

/* 5. RECOVERY GAPS — animated weekly muscle split bar timeline */
const RECOVERY_DAYS = [
  { day: 'M', label: 'Push',    rest: false, height: 80 },
  { day: 'T', label: 'Rest',    rest: true,  height: 20 },
  { day: 'W', label: 'Pull',    rest: false, height: 72 },
  { day: 'T', label: 'Rest',    rest: true,  height: 20 },
  { day: 'F', label: 'Legs',    rest: false, height: 88 },
  { day: 'S', label: 'Active',  rest: false, height: 48 },
  { day: 'S', label: 'Rest',    rest: true,  height: 20 },
];

function RecoveryVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className="bv bv--recovery">
      <div className="bv__rec-chart">
        {RECOVERY_DAYS.map(({ day, label, rest, height }, i) => (
          <div key={i} className="bv__rec-col">
            <AnimatePresence>
              {hovered && !rest && (
                <motion.span
                  className="bv__rec-muscle"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.08 }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            <div className="bv__rec-bar-track">
              <motion.div
                className={`bv__rec-bar${rest ? ' bv__rec-bar--rest' : ''}`}
                animate={{ height: hovered ? `${height}%` : rest ? '15%' : '45%' }}
                initial={{ height: rest ? '15%' : '45%' }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="bv__rec-day">{day}</span>
          </div>
        ))}
      </div>
      <div className="bv__rec-footer">
        <span className="bv__rec-pill">3 rest days</span>
      </div>
    </div>
  );
}

/* 6. YOUR GOALS — Target icon + 3 spring-animated pill rows */
const GOAL_ROWS = [
  {
    modifier: 'loss',
    icon: '↓',
    label: 'Weight Loss',
    meta: '0.5 kg/week',
    hoveredStyle: { x: -12, y: -6, rotate: -3 },
    hoveredBg: 'var(--color-teal)',
    hoveredColor: 'white',
  },
  {
    modifier: 'gain',
    icon: '↑',
    label: 'Muscle Gain',
    meta: '0.25 kg/week',
    hoveredStyle: { x: 0, y: -4, scale: 1.04 },
    hoveredBg: 'var(--color-purple)',
    hoveredColor: 'white',
  },
  {
    modifier: 'recomp',
    icon: '↔',
    label: 'Body Recomposition',
    meta: 'Maintenance',
    hoveredStyle: { x: 10, y: 4, rotate: 2 },
    hoveredBg: 'var(--color-text-primary)',
    hoveredColor: 'white',
  },
];

function GoalsVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className="bv bv--goals">
      <Target
        size={32}
        color={hovered ? COLOR_PURPLE : COLOR_TEAL}
        strokeWidth={1.5}
        style={{ transition: 'color 0.25s ease', marginBottom: 'var(--space-1)' }}
      />
      {GOAL_ROWS.map(({ modifier, icon, label, meta, hoveredStyle, hoveredBg, hoveredColor }) => (
        <motion.div
          key={modifier}
          className={`bv__goal-row bv__goal-row--${modifier}`}
          animate={hovered
            ? { ...hoveredStyle, backgroundColor: hoveredBg, color: hoveredColor, borderColor: hoveredBg }
            : { x: 0, y: 0, rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <span className="bv__goal-label">{icon} {label}</span>
          <span className="bv__goal-value">{meta}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* 7. TIME TO GOAL — circular progress ring */
const RING_R   = 46;
const RING_C   = 2 * Math.PI * RING_R;
const RING_75  = RING_C * 0.75;

function TimeGoalVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className="bv bv--timegoal">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Track */}
        <circle cx="60" cy="60" r={RING_R} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="10" />
        {/* Fill arc */}
        <motion.circle
          cx="60" cy="60" r={RING_R}
          fill="none"
          stroke={COLOR_TEAL}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${RING_C}`}
          animate={{
            strokeDashoffset: hovered ? RING_C - RING_75 : RING_C,
          }}
          initial={{ strokeDashoffset: RING_C }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          transform="rotate(-90 60 60)"
        />
        {/* Centre text */}
        <text x="60" y="55" textAnchor="middle" fill={COLOR_TEXT_MUTED} fontSize="28" fontFamily="var(--font-mono)" fontWeight="700" opacity="0.9">12</text>
        <text x="60" y="72" textAnchor="middle" fill={COLOR_TEXT_MUTED} fontSize="11" fontFamily="var(--font-mono)" opacity="0.6">weeks</text>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CARD DEFINITIONS
───────────────────────────────────────────── */
interface CardDef {
  area: string;
  title: string;
  body: string;
  tall?: boolean;
}

const CARDS: CardDef[] = [
  {
    area: 'calories',
    title: 'Calorie Targets',
    body: 'Exact daily intake — deficit for loss, surplus for gain, maintenance for recomp.',
  },
  {
    area: 'proven',
    title: 'Proven by Math',
    body: 'Gurobi LP finds the optimal solution across 140+ variables and 35+ constraints.',
    tall: true,
  },
  {
    area: 'macros',
    title: 'Macro Balance',
    body: 'Protein, carbs, and fat targets set as hard constraints — never violated.',
  },
  {
    area: 'schedule',
    title: 'Your Schedule',
    body: 'Available days and session length become constraints. Never overbooked.',
  },
  {
    area: 'recovery',
    title: 'Recovery Gaps',
    body: 'Minimum rest between muscle groups enforced. Progressive overload built in.',
  },
  {
    area: 'goals',
    title: 'Your Goals',
    body: 'Weight Loss, Muscle Gain, or Body Recomposition — each runs a different model.',
  },
  {
    area: 'timegoal',
    title: 'Time to Goal',
    body: 'Set your deadline. The model works backwards to the fastest feasible plan.',
  },
];

/* ─────────────────────────────────────────────
   BENTO CARD WRAPPER
───────────────────────────────────────────── */
function BentoCard({ area, title, body, tall }: CardDef) {
  const [hovered, setHovered] = useState(false);

  const renderVisual = () => {
    if (area === 'calories')  return <CalorieVisual  hovered={hovered} />;
    if (area === 'proven')    return <ProvenVisual   hovered={hovered} />;
    if (area === 'macros')    return <MacroVisual    hovered={hovered} />;
    if (area === 'schedule')  return <ScheduleVisual hovered={hovered} />;
    if (area === 'recovery')  return <RecoveryVisual hovered={hovered} />;
    if (area === 'goals')     return <GoalsVisual    hovered={hovered} />;
    if (area === 'timegoal')  return <TimeGoalVisual hovered={hovered} />;
    return null;
  };

  return (
    <motion.div
      className={`bento-card bento-card--${area}${tall ? ' bento-card--tall' : ''}`}
      style={{ gridArea: area } as React.CSSProperties}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      variants={cardChild}
    >
      <div className="bento-card__visual">{renderVisual()}</div>
      <div className="bento-card__footer">
        <h3 className="bento-card__title">{title}</h3>
        <p className="bento-card__desc">{body}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   SECTION
───────────────────────────────────────────── */
export default function BentoGrid() {
  return (
    <section className="bento-section">
      <motion.div
        className="bento-section__inner"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <p className="bento-section__label">What We Optimise</p>
        <h2 className="bento-section__title">Every Constraint, Solved.</h2>
        <p className="bento-section__subtitle">
          OptiFit's linear programme balances calories, macros, budget, schedule, and equipment — simultaneously.
        </p>
        <motion.div
          className="bento-grid"
          variants={cardStagger(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {CARDS.map((card) => (
            <BentoCard key={card.area} {...card} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

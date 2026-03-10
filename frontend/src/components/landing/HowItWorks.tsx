import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  LineChart, Line, XAxis, YAxis, ReferenceLine,
  Tooltip, ResponsiveContainer, Dot,
} from 'recharts';
import { TrendingDown, Dumbbell, Repeat2 } from 'lucide-react';
import { COLOR_TEAL, COLOR_TEXT_MUTED } from '../../tokens/chartColors';
import './HowItWorks.css';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const REVEAL = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const PROGRESS_DATA = [
  { week: 'W1',  weight: 83.0 },
  { week: 'W2',  weight: 82.6 },
  { week: 'W3',  weight: 83.1 },
  { week: 'W4',  weight: 82.4 },
  { week: 'W5',  weight: 81.9 },
  { week: 'W6',  weight: 82.2 },
  { week: 'W7',  weight: 81.5 },
  { week: 'W8',  weight: 80.8 },
  { week: 'W9',  weight: 81.2 },
  { week: 'W10', weight: 80.3 },
  { week: 'W11', weight: 79.8 },
  { week: 'W12', weight: 79.1 },
];

const TERMINAL_LINES = [
  'Initialising solver...',
  'Variables: 140+',
  'Constraints: 35+',
  'Running Gurobi LP...',
  'Optimal solution found \u2713',
];

/* ── Step 1 visual: goal cards ── */
function GoalCards() {
  const goals = [
    { label: 'Weight Loss',        mod: 'teal',    icon: <TrendingDown size={16} /> },
    { label: 'Muscle Gain',        mod: 'purple',  icon: <Dumbbell size={16} /> },
    { label: 'Body Recomposition', mod: 'charcoal',icon: <Repeat2 size={16} /> },
  ];
  return (
    <div className="hiw-visual hiw-visual--goal-cards">
      {goals.map((g, i) => (
        <motion.div
          key={g.label}
          className={`hiw-goal-card hiw-goal-card--${g.mod}`}
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, delay: i * 0.08, ease: EASE }}
        >
          <span className="hiw-goal-card__icon">{g.icon}</span>
          <span className="hiw-goal-card__label">{g.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Step 2 visual: terminal ── */
function Terminal() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showCursor, setShowCursor] = useState(false);
  const startedRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          TERMINAL_LINES.forEach((_, i) => {
            setTimeout(() => {
              setVisibleCount(i + 1);
              if (i === TERMINAL_LINES.length - 1) setShowCursor(true);
            }, i * 300);
          });
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="hiw-visual hiw-terminal">
      <div className="hiw-terminal__bar">
        <span className="hiw-terminal__dot" />
        <span className="hiw-terminal__dot" />
        <span className="hiw-terminal__dot" />
      </div>
      <div className="hiw-terminal__body">
        {TERMINAL_LINES.slice(0, visibleCount).map((line, i) => (
          <p key={i} className="hiw-terminal__line">
            <span className="hiw-terminal__prompt">{'>'}</span> {line}
          </p>
        ))}
        {showCursor && <span className="hiw-terminal__cursor" />}
      </div>
    </div>
  );
}

/* ── Step 3 visual: meal + workout cards ── */
const MEALS = [
  { name: 'Oats',    grams: '80g',  kcal: '303 kcal' },
  { name: 'Chicken', grams: '200g', kcal: '330 kcal' },
  { name: 'Rice',    grams: '150g', kcal: '195 kcal' },
];
const WORKOUTS = [
  { name: 'Bench Press', sets: '4 \u00d7 8' },
  { name: 'Squat',       sets: '4 \u00d7 6' },
  { name: 'Deadlift',    sets: '3 \u00d7 5' },
];

function PlanCards() {
  return (
    <div className="hiw-visual hiw-plan-cards">
      <div className="hiw-plan-card">
        <p className="hiw-plan-card__title">Today's Meals</p>
        {MEALS.map((m, i) => (
          <motion.div
            key={m.name}
            className="hiw-plan-row"
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.35, delay: i * 0.1, ease: EASE }}
          >
            <span className="hiw-plan-row__name">{m.name}</span>
            <span className="hiw-plan-row__grams">{m.grams}</span>
            <span className="hiw-plan-row__badge">{m.kcal}</span>
          </motion.div>
        ))}
      </div>
      <div className="hiw-plan-card">
        <p className="hiw-plan-card__title">Today's Workout</p>
        {WORKOUTS.map((w, i) => (
          <motion.div
            key={w.name}
            className="hiw-plan-row"
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.35, delay: i * 0.1, ease: EASE }}
          >
            <span className="hiw-plan-row__name">{w.name}</span>
            <span className="hiw-plan-row__sets">{w.sets}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 4 visual: weight chart ── */
function WeightChart() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const lastIndex = PROGRESS_DATA.length - 1;

  return (
    <div ref={ref} className="hiw-visual hiw-chart-wrap">
      <div className="hiw-chart">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={PROGRESS_DATA} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="week"
              tick={{ fill: COLOR_TEXT_MUTED, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[78.5, 84]} hide />
            <Tooltip
              formatter={(value: unknown) => [`${(value as number).toFixed(1)}kg`]}
              labelFormatter={(label: unknown) => `Week ${String(label).replace('W', '')}`}
              contentStyle={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              itemStyle={{ color: COLOR_TEAL }}
            />
            <ReferenceLine
              y={79.1}
              stroke={COLOR_TEAL}
              strokeDasharray="4 3"
              strokeOpacity={0.5}
              label={{ value: 'Goal', position: 'insideTopRight', fill: COLOR_TEAL, fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke={COLOR_TEAL}
              strokeWidth={2}
              dot={(props) => {
                const { index, cx, cy } = props;
                if (index !== lastIndex) return <g key={index} />;
                return (
                  <Dot key={index} cx={cx} cy={cy} r={4} fill={COLOR_TEAL} stroke="none" />
                );
              }}
              isAnimationActive={inView}
              animationDuration={1400}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {inView && (
        <motion.div
          className="hiw-insight-pill"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          +1 gym day saves 0.8 weeks
        </motion.div>
      )}
    </div>
  );
}

/* ── Step wrapper ── */
interface StepProps {
  number: string;
  numberColor: 'teal' | 'purple';
  title: string;
  body: string;
  visual: React.ReactNode;
  reverse?: boolean;
}

function Step({ number, numberColor, title, body, visual, reverse = false }: StepProps) {
  return (
    <motion.div
      className={`hiw-step${reverse ? ' hiw-step--reverse' : ''}`}
      variants={REVEAL}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="hiw-step__content">
        <span className={`hiw-step__number hiw-step__number--${numberColor}`}>{number}</span>
        <h3 className="hiw-step__title">{title}</h3>
        <p className="hiw-step__body">{body}</p>
      </div>
      <div className="hiw-step__visual">{visual}</div>
    </motion.div>
  );
}

/* ── Section ── */
export default function HowItWorks() {
  return (
    <section className="hiw" id="how-it-works">
      <div className="hiw__header">
        <h2 className="hiw__title">How <span style={{ color: 'var(--color-teal)' }}>Opti</span><span>Fit</span> Works</h2>
        <p className="hiw__subtitle">
          Four steps from goal to results — powered by mathematical optimisation.
        </p>
      </div>

      <div className="hiw__body">
        <div className="hiw__line" aria-hidden="true" />
        <div className="hiw__steps">
          <Step
            number="01"
            numberColor="teal"
            title="Tell Us Your Goal"
            body="Choose from Weight Loss, Muscle Gain, or Body Recomposition. Each mode runs a different optimisation model tailored to your biology and schedule."
            visual={<GoalCards />}
          />
          <Step
            number="02"
            numberColor="purple"
            title="We Run The Model"
            body="Our Gurobi-powered engine solves a linear programme across 140+ variables and 35+ constraints — finding your mathematically optimal plan in seconds."
            visual={<Terminal />}
            reverse
          />
          <Step
            number="03"
            numberColor="teal"
            title="Follow Your Plan"
            body="Every morning you get a precise meal plan and workout schedule — optimised to your calories, macros, and available equipment."
            visual={<PlanCards />}
          />
          <Step
            number="04"
            numberColor="purple"
            title="Track Your Progress"
            body="See your projected weight week by week. Our sensitivity analysis shows exactly how adding one extra gym day accelerates your results."
            visual={<WeightChart />}
            reverse
          />
        </div>
      </div>
    </section>
  );
}

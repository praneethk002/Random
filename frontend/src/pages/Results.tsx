import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download } from 'lucide-react';
import { motion } from 'motion/react';
import KPICard from '../components/results/KPICard';
import MealTable from '../components/results/MealTable';
import WorkoutCalendar from '../components/results/WorkoutCalendar';
import MacroPieChart from '../components/results/MacroPieChart';
import WeightLineChart from '../components/results/WeightLineChart';
import SensitivityPanel from '../components/results/SensitivityPanel';
import {
  PLACEHOLDER_KPI,
  PLACEHOLDER_MEALS,
  PLACEHOLDER_SCHEDULE,
  PLACEHOLDER_MACROS,
  PLACEHOLDER_PROJECTION,
  PLACEHOLDER_INSIGHTS,
  type KPISummary,
  type MealItem,
  type WorkoutSchedule,
  type MacroData,
  type ProjectionPoint,
  type SensitivityInsight,
} from '../data/placeholders';
import { staggerContainer, staggerChild, cardStagger, cardChild } from '../tokens/variants';
import { sensitivity, type OptimiseRequest, type OptimiseResponse } from '../api/fitopt';
import './Results.css';

// ── Transform helpers ──

const DAY_KEYS: Record<string, keyof WorkoutSchedule> = {
  Mon: 'monday', Tue: 'tuesday', Wed: 'wednesday', Thu: 'thursday',
  Fri: 'friday', Sat: 'saturday', Sun: 'sunday',
};
const MEAL_NAMES = ['Breakfast', 'Snack', 'Lunch', 'Snack', 'Dinner', 'Evening'];

function transformResponse(api: OptimiseResponse) {
  const kpi: KPISummary = {
    weeks_to_goal: api.summary.weeks_to_goal,
    daily_calories: api.summary.daily_calories,
    weekly_gym_hours: api.summary.weekly_gym_hours,
  };

  const meals: MealItem[] = api.meal_plan.map((item, i) => ({
    meal: MEAL_NAMES[i % MEAL_NAMES.length],
    food: item.food,
    grams: item.grams,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
  }));

  const schedule: WorkoutSchedule = {
    monday: null, tuesday: null, wednesday: null, thursday: null,
    friday: null, saturday: null, sunday: null,
  };
  for (const [day, entry] of Object.entries(api.workout_schedule)) {
    const key = DAY_KEYS[day];
    if (!key) continue;
    if (entry.type !== 'rest') {
      schedule[key] = [{
        exercise: entry.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        sets: 3,
        reps: '10–12',
        duration_min: Math.round(entry.duration * 60),
        muscle_group: entry.type,
      }];
    }
  }

  const macroTotal = api.macros.protein + api.macros.carbs + api.macros.fat;
  const macros: MacroData = macroTotal > 0
    ? {
        protein_pct: Math.round((api.macros.protein / macroTotal) * 100),
        carbs_pct:   Math.round((api.macros.carbs   / macroTotal) * 100),
        fat_pct:     Math.round((api.macros.fat      / macroTotal) * 100),
      }
    : PLACEHOLDER_MACROS;

  const projection: ProjectionPoint[] = api.projection.map((p) => ({
    week: p.week,
    weight_kg: p.weight,
  }));

  return { kpi, meals, schedule, macros, projection };
}

// ── SVG success animation ──

const CIRCLE_R = 36;
const CIRCLE_C = 2 * Math.PI * CIRCLE_R;

function SuccessCheck() {
  const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
  return (
    <div id="lottie-checkmark" className="results__success-icon" aria-hidden="true">
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <motion.circle
          cx="48" cy="48" r={CIRCLE_R}
          stroke="var(--color-teal)" strokeWidth="3" fill="none"
          strokeLinecap="round" strokeDasharray={CIRCLE_C}
          initial={{ strokeDashoffset: CIRCLE_C }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.6, ease }}
        />
        <motion.polyline
          points="28,50 42,64 68,34"
          stroke="var(--color-teal)" strokeWidth="3" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="60"
          initial={{ strokeDashoffset: 60 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.4, delay: 0.55, ease }}
        />
      </svg>
    </div>
  );
}

// ── Main component ──

export default function Results() {
  const location = useLocation();
  const routeState = location.state as {
    apiResponse?: OptimiseResponse;
    formPayload?: OptimiseRequest;
  } | null;

  const live = routeState?.apiResponse ? transformResponse(routeState.apiResponse) : null;

  const kpi        = live?.kpi        ?? PLACEHOLDER_KPI;
  const meals      = live?.meals      ?? PLACEHOLDER_MEALS;
  const schedule   = live?.schedule   ?? PLACEHOLDER_SCHEDULE;
  const macros     = live?.macros     ?? PLACEHOLDER_MACROS;
  const projection = live?.projection ?? PLACEHOLDER_PROJECTION;

  const [sensitivityInsights, setSensitivityInsights] = useState<SensitivityInsight[] | null>(null);
  const [sensitivityLoading, setSensitivityLoading] = useState(false);

  const handleSensitivity = async () => {
    if (!routeState?.formPayload) return;
    setSensitivityLoading(true);
    try {
      const delta = await sensitivity(routeState.formPayload);
      const change = delta.weeks_to_goal != null
        ? (delta.weeks_to_goal - kpi.weeks_to_goal).toFixed(1)
        : null;
      const sign = change && parseFloat(change) < 0 ? '' : '+';
      setSensitivityInsights([
        { id: 'gym-day', text: `+1 gym day: ${sign}${change ?? '—'} weeks to goal` },
      ]);
    } finally {
      setSensitivityLoading(false);
    }
  };

  return (
    <motion.main
      className="results"
      variants={staggerContainer(0.1)}
      initial="hidden"
      animate="visible"
    >
      {/* Hero row — check animation + title + download */}
      <motion.div className="results__hero-row" variants={staggerChild}>
        <SuccessCheck />
        <div className="results__hero-text">
          <h1 className="results__heading">Your Optimal Plan is Ready</h1>
          <p className="results__subheading">Generated by FitOpt engine · Contract-stable output</p>
        </div>
        <button
          className="results__download-btn"
          onClick={() => window.print()}
          aria-label="Download plan as PDF"
        >
          <Download size={16} />
          Download PDF
        </button>
      </motion.div>

      {/* KPI cards */}
      <motion.section
        className="results__kpi-row"
        aria-label="Key metrics"
        variants={cardStagger(0.12)}
      >
        <motion.div variants={cardChild}>
          <KPICard label="Weeks to Goal"    rawValue={kpi.weeks_to_goal}    decimals={1} />
        </motion.div>
        <motion.div variants={cardChild}>
          <KPICard label="Daily Calories"   rawValue={kpi.daily_calories}   suffix=" kcal" />
        </motion.div>
        <motion.div variants={cardChild}>
          <KPICard label="Weekly Gym Hours" rawValue={kpi.weekly_gym_hours} suffix=" hrs/week" decimals={1} />
        </motion.div>
      </motion.section>

      <motion.section className="results__section" aria-label="Macro breakdown" variants={staggerChild}>
        <h2 className="results__section-title">Macro Breakdown</h2>
        <MacroPieChart macros={macros} />
      </motion.section>

      <motion.section className="results__section" aria-label="Meal plan" variants={staggerChild}>
        <h2 className="results__section-title">Meal Plan</h2>
        <MealTable data={meals} />
      </motion.section>

      <motion.section className="results__section" aria-label="Workout schedule" variants={staggerChild}>
        <h2 className="results__section-title">Workout Schedule</h2>
        <WorkoutCalendar schedule={schedule} />
      </motion.section>

      <motion.section className="results__section" aria-label="Weight projection" variants={staggerChild}>
        <h2 className="results__section-title">Weight Projection</h2>
        <WeightLineChart projection={projection} />
      </motion.section>

      <motion.section className="results__section" aria-label="Sensitivity analysis" variants={staggerChild}>
        <h2 className="results__section-title">Sensitivity</h2>
        {routeState?.formPayload && (
          <button
            className="results__sensitivity-btn"
            onClick={handleSensitivity}
            disabled={sensitivityLoading}
          >
            {sensitivityLoading ? 'Calculating…' : 'What if I add 1 more gym day?'}
          </button>
        )}
        <SensitivityPanel insights={sensitivityInsights ?? PLACEHOLDER_INSIGHTS} />
      </motion.section>
    </motion.main>
  );
}

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
import './Results.css';

// ── API response shape (matches contract from POST /api/optimise) ──

interface ApiMealItem {
  meal: string; food: string; grams: number;
  calories: number; protein: number; carbs: number; fat: number;
}

interface ApiWorkoutEntry {
  exercise: string; sets: number; reps: number;
  duration_min: number; muscle_group: string;
}

interface ApiResponse {
  summary: {
    weeks_to_goal: number;
    daily_calories: number;
    weekly_food_cost: number;
    weekly_gym_hours: number;
  };
  meal_plan: Record<string, ApiMealItem[]>;
  workout_schedule: Record<string, ApiWorkoutEntry[]>;
  projection: Array<{ week: number; weight_kg: number }>;
}

// ── Transform helpers ──

const DAY_KEYS: Record<string, keyof WorkoutSchedule> = {
  Mon: 'monday', Tue: 'tuesday', Wed: 'wednesday', Thu: 'thursday',
  Fri: 'friday', Sat: 'saturday', Sun: 'sunday',
};
const MEAL_NAMES = ['Breakfast', 'Snack', 'Lunch', 'Snack', 'Dinner', 'Evening'];

function transformResponse(api: ApiResponse) {
  const kpi: KPISummary = {
    weeks_to_goal: api.summary.weeks_to_goal,
    daily_calories: api.summary.daily_calories,
    weekly_gym_hours: api.summary.weekly_gym_hours,
  };

  // meal_plan is keyed by day; flatten to a single list
  const allMealItems = Object.values(api.meal_plan).flat();
  const meals: MealItem[] = allMealItems.map((item) => ({
    meal: item.meal,
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
  for (const [day, entries] of Object.entries(api.workout_schedule)) {
    const key = DAY_KEYS[day];
    if (!key || !entries.length) continue;
    schedule[key] = entries.map((e) => ({
      exercise: e.exercise,
      sets: e.sets,
      reps: String(e.reps),
      duration_min: e.duration_min,
      muscle_group: e.muscle_group,
    }));
  }

  // Compute macro totals from Monday's meals (representative day)
  const mondayItems = api.meal_plan['monday'] ?? allMealItems;
  const totalProtein = mondayItems.reduce((s, i) => s + i.protein, 0);
  const totalCarbs   = mondayItems.reduce((s, i) => s + i.carbs, 0);
  const totalFat     = mondayItems.reduce((s, i) => s + i.fat, 0);
  const macroTotal   = totalProtein + totalCarbs + totalFat;
  const macros: MacroData = macroTotal > 0
    ? {
        protein_pct: Math.round((totalProtein / macroTotal) * 100),
        carbs_pct:   Math.round((totalCarbs   / macroTotal) * 100),
        fat_pct:     Math.round((totalFat      / macroTotal) * 100),
      }
    : PLACEHOLDER_MACROS;

  const projection: ProjectionPoint[] = api.projection.map((p) => ({
    week: p.week,
    weight_kg: p.weight_kg,
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
    apiResponse?: ApiResponse;
    formPayload?: Record<string, unknown>;
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
      const res = await fetch('/api/sensitivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeState.formPayload),
      });
      if (res.ok) {
        const delta = await res.json() as { weeks_to_goal?: number };
        const change = delta.weeks_to_goal != null
          ? (delta.weeks_to_goal - kpi.weeks_to_goal).toFixed(1)
          : null;
        const sign = change && parseFloat(change) < 0 ? '' : '+';
        setSensitivityInsights([
          { id: 'gym-day', text: `+1 gym day: ${sign}${change ?? '—'} weeks to goal` },
        ]);
      }
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
          <p className="results__subheading">Generated by Gurobi LP solver · Optimal solution found</p>
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

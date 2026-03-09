// src/data/placeholders.ts
// Single source of truth for all Phase 5 TypeScript interfaces and placeholder data.
// Interfaces match the frozen API contract shape from POST /api/optimise.
// Praneeth replaces the placeholder constants with real API response data.

// ── Interfaces matching frozen API contract ──────────────────────────────

export interface KPISummary {
  weeks_to_goal: number;
  daily_calories: number;
  weekly_gym_hours: number;
}

export interface MealItem {
  meal: string;
  food: string;
  grams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface ExerciseEntry {
  exercise: string;
  sets: number;
  reps: string;
  duration_min: number;
  muscle_group: string;
}

export interface WorkoutSchedule {
  monday: ExerciseEntry[] | null;
  tuesday: ExerciseEntry[] | null;
  wednesday: ExerciseEntry[] | null;
  thursday: ExerciseEntry[] | null;
  friday: ExerciseEntry[] | null;
  saturday: ExerciseEntry[] | null;
  sunday: ExerciseEntry[] | null;
}

export interface MacroData {
  protein_pct: number;
  fat_pct: number;
  carbs_pct: number;
}

export interface ProjectionPoint {
  week: number;
  weight_kg: number;
}

export interface SensitivityInsight {
  id: string;
  text: string;
}

// ── Placeholder data ─────────────────────────────────────────────────────

export const PLACEHOLDER_KPI: KPISummary = {
  weeks_to_goal: 6.8,
  daily_calories: 1897,
  weekly_gym_hours: 3.0,
};

export const PLACEHOLDER_MEALS: MealItem[] = [
  { meal: 'Breakfast', food: 'Oats with banana',             grams: 350, calories: 420, protein: 14, carbs: 72, fat: 8  },
  { meal: 'Snack',     food: 'Greek yogurt + honey',         grams: 200, calories: 178, protein: 18, carbs: 20, fat: 5  },
  { meal: 'Lunch',     food: 'Chicken breast + brown rice',  grams: 450, calories: 520, protein: 48, carbs: 52, fat: 9  },
  { meal: 'Snack',     food: 'Whey protein shake',           grams: 300, calories: 160, protein: 30, carbs: 8,  fat: 3  },
  { meal: 'Dinner',    food: 'Salmon fillet + sweet potato', grams: 480, calories: 540, protein: 42, carbs: 45, fat: 18 },
  { meal: 'Evening',   food: 'Cottage cheese',               grams: 150, calories: 130, protein: 18, carbs: 6,  fat: 5  },
];

export const PLACEHOLDER_SCHEDULE: WorkoutSchedule = {
  monday: [
    { exercise: 'Barbell Squat',     sets: 4, reps: '8-10',  duration_min: 12, muscle_group: 'Legs'      },
    { exercise: 'Romanian Deadlift', sets: 3, reps: '10-12', duration_min: 10, muscle_group: 'Hamstrings' },
    { exercise: 'Leg Press',         sets: 3, reps: '12-15', duration_min: 8,  muscle_group: 'Quads'     },
    { exercise: 'Calf Raises',       sets: 4, reps: '15-20', duration_min: 6,  muscle_group: 'Calves'    },
  ],
  tuesday: null,
  wednesday: [
    { exercise: 'Bench Press',             sets: 4, reps: '8-10',  duration_min: 12, muscle_group: 'Chest'    },
    { exercise: 'Incline Dumbbell Press',  sets: 3, reps: '10-12', duration_min: 10, muscle_group: 'Chest'    },
    { exercise: 'Cable Fly',               sets: 3, reps: '12-15', duration_min: 8,  muscle_group: 'Chest'    },
    { exercise: 'Tricep Pushdown',         sets: 3, reps: '12-15', duration_min: 7,  muscle_group: 'Triceps'  },
  ],
  thursday: null,
  friday: [
    { exercise: 'Pull-Up',       sets: 4, reps: '6-8',   duration_min: 10, muscle_group: 'Back'       },
    { exercise: 'Barbell Row',   sets: 4, reps: '8-10',  duration_min: 12, muscle_group: 'Back'       },
    { exercise: 'Face Pull',     sets: 3, reps: '15-20', duration_min: 7,  muscle_group: 'Rear Delts' },
    { exercise: 'Barbell Curl',  sets: 3, reps: '10-12', duration_min: 7,  muscle_group: 'Biceps'    },
  ],
  saturday: null,
  sunday: null,
};

export const PLACEHOLDER_MACROS: MacroData = {
  protein_pct: 30,
  fat_pct: 25,
  carbs_pct: 45,
};

export const PLACEHOLDER_PROJECTION: ProjectionPoint[] = [
  { week: 0, weight_kg: 80   },
  { week: 1, weight_kg: 79.1 },
  { week: 2, weight_kg: 78.3 },
  { week: 3, weight_kg: 77.6 },
  { week: 4, weight_kg: 76.9 },
  { week: 5, weight_kg: 76.2 },
  { week: 6, weight_kg: 75.6 },
  { week: 7, weight_kg: 75   },
  { week: 8, weight_kg: 75   },
];

export const PLACEHOLDER_INSIGHTS: SensitivityInsight[] = [
  { id: 'gym-day', text: '+1 gym day saves 0.8 weeks' },
];

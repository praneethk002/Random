// API request/response types for POST /api/fitness-plan

export interface FitnessRequest {
  goal: string;
  sex: string;
  age: number;
  height_cm: number;
  activity_level: string;
  start_weight_kg: number;
  target_weight_kg: number;
  weeks: number;
  gym_days: string[];
  session_length: string;
  dietary_restrictions: string[];
  foods_avoid: string[];
  foods_enjoy: string[];
}

export interface FitnessResponse {
  summary: {
    weeks_to_goal: number;
    daily_calories: number;
    weekly_gym_hours: number;
  };
  meal_plan: Array<{
    meal: string;
    food: string;
    grams: number;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  }>;
  workout_schedule: {
    monday: WorkoutDay | null;
    tuesday: WorkoutDay | null;
    wednesday: WorkoutDay | null;
    thursday: WorkoutDay | null;
    friday: WorkoutDay | null;
    saturday: WorkoutDay | null;
    sunday: WorkoutDay | null;
  };
  macros: {
    protein_g: number;
    fat_g: number;
    carbs_g: number;
  };
  projection: Array<{
    week: number;
    weight_kg: number;
  }>;
}

interface WorkoutDay {
  exercise: string;
  duration_min: number;
  calories_burned: number;
}

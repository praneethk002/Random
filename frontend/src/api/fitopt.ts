export interface OptimiseRequest {
  goal: 'weight_loss' | 'muscle_gain' | 'body_recomposition';
  weight_kg: number;
  target_kg: number;
  weeks: number;
  budget_day: number;
  gym_days: number;
  time_per_session: number;
  dietary_restrictions: string[];
  availability: Record<string, number>;
}

export interface OptimiseResponse {
  summary: {
    weeks_to_goal: number;
    daily_calories: number;
    weekly_food_cost: number;
    weekly_gym_hours: number;
  };
  meal_plan: Array<{
    food: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    cost: number;
  }>;
  workout_schedule: Record<string, { type: string; duration: number; calories_burned: number }>;
  macros: { protein: number; carbs: number; fat: number };
  projection: Array<{ week: number; weight: number }>;
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = (body as { error?: string; message?: string }).error
      ?? (body as { message?: string }).message
      ?? `Server error ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function optimise(payload: OptimiseRequest): Promise<OptimiseResponse> {
  return postJson<OptimiseResponse>('/api/optimise', payload);
}

export function sensitivity(payload: OptimiseRequest): Promise<{ weeks_to_goal: number }> {
  return postJson<{ weeks_to_goal: number }>('/api/sensitivity', payload);
}

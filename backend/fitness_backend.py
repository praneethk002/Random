from __future__ import annotations

from typing import Any

from nutrition_model import VALID_GOALS, solve_nutrition
from workout_model import DAY_ORDER, solve_workout


DEFAULT_PAYLOAD: dict[str, Any] = {
    "goal": "weight_loss",
    "weight_kg": 80.0,
    "target_kg": 75.0,
    "weeks": 8,
    "budget_day": 10.0,
    "gym_days": 4,
    "time_per_session": 1.0,
    "dietary_restrictions": [],
    "availability": {day: 1 for day in DAY_ORDER},
}


def normalize_payload(payload: dict[str, Any]) -> dict[str, Any]:
    normalized = {**DEFAULT_PAYLOAD, **(payload or {})}
    normalized["goal"] = str(normalized["goal"])
    if normalized["goal"] not in VALID_GOALS:
        raise ValueError(f"Unsupported goal '{normalized['goal']}'.")

    for field in ("weight_kg", "target_kg", "budget_day", "time_per_session"):
        normalized[field] = float(normalized[field])
    for field in ("weeks", "gym_days"):
        normalized[field] = int(normalized[field])

    normalized["dietary_restrictions"] = list(normalized.get("dietary_restrictions", []))
    normalized["availability"] = {day: int(normalized.get("availability", {}).get(day, 0)) for day in DAY_ORDER}
    return normalized


def _projection(weight_kg: float, target_kg: float, weeks: int) -> list[dict[str, float]]:
    if weeks <= 0:
        return [{"week": 0, "weight": round(weight_kg, 2)}]
    delta = (target_kg - weight_kg) / weeks
    return [{"week": week, "weight": round(weight_kg + delta * week, 2)} for week in range(weeks + 1)]


def run_fitopt_pipeline(payload: dict[str, Any]) -> dict[str, Any]:
    p = normalize_payload(payload)

    meal_plan = solve_nutrition(
        goal=p["goal"],
        weight_kg=p["weight_kg"],
        budget_day=p["budget_day"],
        dietary_restrictions=p["dietary_restrictions"],
    )
    workout_schedule = solve_workout(
        goal=p["goal"],
        weight_kg=p["weight_kg"],
        gym_days=p["gym_days"],
        time_per_session=p["time_per_session"],
        availability=p["availability"],
    )

    macros = {
        "protein": round(sum(item["protein"] for item in meal_plan), 1),
        "carbs": round(sum(item["carbs"] for item in meal_plan), 1),
        "fat": round(sum(item["fat"] for item in meal_plan), 1),
    }
    weekly_gym_hours = round(sum(day["duration"] for day in workout_schedule.values()), 2)
    avg_daily_calories = round(sum(item["calories"] for item in meal_plan), 1)
    weekly_food_cost = round(sum(item["cost"] for item in meal_plan) * 7, 2)

    return {
        "summary": {
            "weeks_to_goal": p["weeks"],
            "daily_calories": avg_daily_calories,
            "weekly_food_cost": weekly_food_cost,
            "weekly_gym_hours": weekly_gym_hours,
        },
        "meal_plan": meal_plan,
        "workout_schedule": workout_schedule,
        "macros": macros,
        "projection": _projection(p["weight_kg"], p["target_kg"], p["weeks"]),
    }


def run_sensitivity(payload: dict[str, Any]) -> dict[str, float]:
    p = normalize_payload(payload)
    baseline_effort = max(1, p["gym_days"])
    improved = baseline_effort + 1
    estimate = round(max(1.0, p["weeks"] * (baseline_effort / improved)), 1)
    return {"weeks_to_goal": estimate}

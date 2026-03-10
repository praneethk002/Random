from __future__ import annotations

import csv
from typing import Any

from config import DATA_DIR

VALID_GOALS = ("weight_loss", "muscle_gain", "body_recomposition")


def _food_table() -> list[dict[str, Any]]:
    with (DATA_DIR / "foods.csv").open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    numeric = {
        "calories_per_100g",
        "protein_per_100g",
        "carbs_per_100g",
        "fat_per_100g",
        "cost_per_100g",
        "vegetarian",
        "vegan",
        "gluten_free",
        "dairy_free",
    }
    for row in rows:
        for key in numeric:
            row[key] = float(row[key])
    return rows


def solve_nutrition(
    goal: str,
    weight_kg: float,
    budget_day: float,
    dietary_restrictions: list[str] | None = None,
) -> list[dict[str, Any]]:
    foods = _food_table()
    restrictions = set(dietary_restrictions or [])

    def allowed(food: dict[str, Any]) -> bool:
        if "vegan" in restrictions and food["vegan"] != 1:
            return False
        if "vegetarian" in restrictions and food["vegetarian"] != 1:
            return False
        if "gluten_free" in restrictions and food["gluten_free"] != 1:
            return False
        if "dairy_free" in restrictions and food["dairy_free"] != 1:
            return False
        return True

    filtered = [food for food in foods if allowed(food)]
    if not filtered:
        raise ValueError("No foods available for the selected restrictions.")

    sorted_foods = sorted(filtered, key=lambda row: (-row["protein_per_100g"], row["cost_per_100g"]))

    meal_plan: list[dict[str, Any]] = []
    daily_cost = 0.0
    for row in sorted_foods[:5]:
        grams = 150 if row["category"] in {"lean_protein", "grains"} else 100
        cost = row["cost_per_100g"] * (grams / 100)
        if daily_cost + cost > budget_day:
            continue
        daily_cost += cost
        meal_plan.append(
            {
                "food": row["food"],
                "grams": grams,
                "calories": round(row["calories_per_100g"] * grams / 100, 1),
                "protein": round(row["protein_per_100g"] * grams / 100, 1),
                "carbs": round(row["carbs_per_100g"] * grams / 100, 1),
                "fat": round(row["fat_per_100g"] * grams / 100, 1),
                "cost": round(cost, 2),
            }
        )

    return meal_plan

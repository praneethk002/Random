from __future__ import annotations

import copy
import math
from typing import Any

import numpy as np
import pandas as pd
from gurobipy import GRB, Model, quicksum

VALID_GOALS = ("weight_loss", "muscle_gain", "body_recomposition")
VALID_FITNESS_LEVELS = ("beginner", "intermediate", "advanced")
VALID_SEXES = ("male", "female")
MEAL_SLOTS = ("Breakfast", "Lunch", "Dinner", "Snack")
DAY_ORDER = (
    ("Mon", "monday"),
    ("Tue", "tuesday"),
    ("Wed", "wednesday"),
    ("Thu", "thursday"),
    ("Fri", "friday"),
    ("Sat", "saturday"),
    ("Sun", "sunday"),
)
SHORT_TO_LONG_DAY = dict(DAY_ORDER)
LONG_TO_SHORT_DAY = {long_name: short_name for short_name, long_name in DAY_ORDER}
FITNESS_LEVEL_ORDER = {"beginner": 1, "intermediate": 2, "advanced": 3}
RESISTANCE_TYPES = {"upper", "legs"}

DEFAULT_PROFILE: dict[str, Any] = {
    "goal": "weight_loss",
    "fitness_level": "beginner",
    "sex": "male",
    "age": 26,
    "height_cm": 182,
    "weight_kg": 80.0,
    "target_kg": 75.0,
    "weeks": 8,
    "budget_day": 10.0,
    "gym_days": 4,
    "time_per_session": 1.25,
    "use_macro_override": False,
    "macro_targets": {"protein_g": None, "carbs_g": None, "fat_g": None},
    "dietary_restrictions": [],
    "equipment_access": "full_gym",
    "food_preferences_enjoy": ["lean_protein", "grains", "fruit"],
    "food_preferences_avoid": ["fish"],
    "availability": {
        "Mon": 1,
        "Tue": 1,
        "Wed": 1,
        "Thu": 0,
        "Fri": 1,
        "Sat": 1,
        "Sun": 0,
    },
}

FOODS_DATA = [
    {"food": "chicken_breast", "category": "lean_protein", "vegetarian": 0, "vegan": 0, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 165, "protein_per_100g": 31, "carbs_per_100g": 0, "fat_per_100g": 3.6, "cost_per_100g": 1.80},
    {"food": "salmon", "category": "fish", "vegetarian": 0, "vegan": 0, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 208, "protein_per_100g": 20, "carbs_per_100g": 0, "fat_per_100g": 13, "cost_per_100g": 2.40},
    {"food": "eggs", "category": "protein", "vegetarian": 1, "vegan": 0, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 143, "protein_per_100g": 13, "carbs_per_100g": 1.1, "fat_per_100g": 10, "cost_per_100g": 0.90},
    {"food": "greek_yogurt", "category": "dairy", "vegetarian": 1, "vegan": 0, "gluten_free": 1, "dairy_free": 0, "halal": 1, "calories_per_100g": 59, "protein_per_100g": 10, "carbs_per_100g": 3.6, "fat_per_100g": 0.4, "cost_per_100g": 0.70},
    {"food": "oats", "category": "grains", "vegetarian": 1, "vegan": 1, "gluten_free": 0, "dairy_free": 1, "halal": 1, "calories_per_100g": 389, "protein_per_100g": 17, "carbs_per_100g": 66, "fat_per_100g": 7, "cost_per_100g": 0.30},
    {"food": "rice", "category": "grains", "vegetarian": 1, "vegan": 1, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 130, "protein_per_100g": 2.7, "carbs_per_100g": 28, "fat_per_100g": 0.3, "cost_per_100g": 0.25},
    {"food": "sweet_potato", "category": "carb_source", "vegetarian": 1, "vegan": 1, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 86, "protein_per_100g": 1.6, "carbs_per_100g": 20, "fat_per_100g": 0.1, "cost_per_100g": 0.35},
    {"food": "broccoli", "category": "vegetables", "vegetarian": 1, "vegan": 1, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 35, "protein_per_100g": 2.8, "carbs_per_100g": 7, "fat_per_100g": 0.4, "cost_per_100g": 0.40},
    {"food": "olive_oil", "category": "healthy_fats", "vegetarian": 1, "vegan": 1, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 884, "protein_per_100g": 0, "carbs_per_100g": 0, "fat_per_100g": 100, "cost_per_100g": 0.80},
    {"food": "tofu", "category": "lean_protein", "vegetarian": 1, "vegan": 1, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 76, "protein_per_100g": 8, "carbs_per_100g": 1.9, "fat_per_100g": 4.8, "cost_per_100g": 0.85},
    {"food": "lentils", "category": "plant_protein", "vegetarian": 1, "vegan": 1, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 116, "protein_per_100g": 9, "carbs_per_100g": 20, "fat_per_100g": 0.4, "cost_per_100g": 0.45},
    {"food": "banana", "category": "fruit", "vegetarian": 1, "vegan": 1, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 89, "protein_per_100g": 1.1, "carbs_per_100g": 23, "fat_per_100g": 0.3, "cost_per_100g": 0.28},
    {"food": "quinoa", "category": "grains", "vegetarian": 1, "vegan": 1, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 120, "protein_per_100g": 4.4, "carbs_per_100g": 21.3, "fat_per_100g": 1.9, "cost_per_100g": 0.75},
    {"food": "avocado", "category": "healthy_fats", "vegetarian": 1, "vegan": 1, "gluten_free": 1, "dairy_free": 1, "halal": 1, "calories_per_100g": 160, "protein_per_100g": 2.0, "carbs_per_100g": 8.5, "fat_per_100g": 14.7, "cost_per_100g": 1.10},
]

EXERCISES_DATA = [
    {"exercise_name": "barbell_squat", "exercise_type": "legs", "equipment_access": "full_gym", "min_fitness_level": "intermediate", "met": 6.5, "duration_hours": 1.0, "volume_score": 10, "recovery_days": 2},
    {"exercise_name": "leg_press", "exercise_type": "legs", "equipment_access": "full_gym", "min_fitness_level": "beginner", "met": 5.5, "duration_hours": 1.0, "volume_score": 8, "recovery_days": 2},
    {"exercise_name": "push_pull_upper", "exercise_type": "upper", "equipment_access": "full_gym", "min_fitness_level": "beginner", "met": 5.0, "duration_hours": 1.0, "volume_score": 8, "recovery_days": 1},
    {"exercise_name": "treadmill_cardio", "exercise_type": "cardio", "equipment_access": "full_gym", "min_fitness_level": "beginner", "met": 7.5, "duration_hours": 0.75, "volume_score": 4, "recovery_days": 0},
    {"exercise_name": "home_upper_body", "exercise_type": "upper", "equipment_access": "home", "min_fitness_level": "beginner", "met": 4.0, "duration_hours": 0.75, "volume_score": 6, "recovery_days": 1},
    {"exercise_name": "home_lower_body", "exercise_type": "legs", "equipment_access": "home", "min_fitness_level": "beginner", "met": 4.5, "duration_hours": 0.75, "volume_score": 6, "recovery_days": 1},
    {"exercise_name": "home_cardio_circuit", "exercise_type": "cardio", "equipment_access": "home", "min_fitness_level": "intermediate", "met": 6.0, "duration_hours": 0.5, "volume_score": 5, "recovery_days": 0},
    {"exercise_name": "outdoor_run", "exercise_type": "cardio", "equipment_access": "outdoors", "min_fitness_level": "beginner", "met": 8.0, "duration_hours": 0.75, "volume_score": 4, "recovery_days": 0},
    {"exercise_name": "outdoor_bodyweight_circuit", "exercise_type": "upper", "equipment_access": "outdoors", "min_fitness_level": "beginner", "met": 5.0, "duration_hours": 0.75, "volume_score": 6, "recovery_days": 1},
    {"exercise_name": "rest_day", "exercise_type": "rest", "equipment_access": "all", "min_fitness_level": "beginner", "met": 1.0, "duration_hours": 0.0, "volume_score": 0, "recovery_days": 0},
]


def get_foods_df() -> pd.DataFrame:
    return pd.DataFrame(FOODS_DATA)


def get_exercises_df() -> pd.DataFrame:
    return pd.DataFrame(EXERCISES_DATA)


def build_default_profile() -> dict[str, Any]:
    return copy.deepcopy(DEFAULT_PROFILE)


def humanize_name(raw_name: str) -> str:
    return raw_name.replace("_", " ").title()


def normalize_availability(availability: dict[str, Any] | None) -> dict[str, int]:
    if not availability:
        return {short_day: 1 for short_day, _ in DAY_ORDER}

    normalized = {short_day: 0 for short_day, _ in DAY_ORDER}
    for key, value in availability.items():
        key_text = str(key).strip().lower()
        short_day = LONG_TO_SHORT_DAY.get(key_text)
        if short_day is None:
            candidate = key_text[:3].title()
            if candidate in SHORT_TO_LONG_DAY:
                short_day = candidate
        if short_day is not None:
            normalized[short_day] = int(bool(value))
    return normalized


def normalize_profile(profile: dict[str, Any] | None) -> dict[str, Any]:
    normalized = build_default_profile()
    incoming = copy.deepcopy(profile or {})

    macro_targets = incoming.pop("macro_targets", None)
    if isinstance(macro_targets, dict):
        normalized["macro_targets"].update(macro_targets)

    if "availability" in incoming:
        normalized["availability"] = normalize_availability(incoming.pop("availability"))

    normalized.update(incoming)
    normalized["goal"] = str(normalized["goal"]).strip().lower()
    normalized["fitness_level"] = str(normalized["fitness_level"]).strip().lower()
    normalized["sex"] = str(normalized["sex"]).strip().lower()

    if normalized["goal"] not in VALID_GOALS:
        raise ValueError(f"Unsupported goal '{normalized['goal']}'. Valid goals are: {', '.join(VALID_GOALS)}.")
    if normalized["fitness_level"] not in VALID_FITNESS_LEVELS:
        raise ValueError("Unsupported fitness level.")
    if normalized["sex"] not in VALID_SEXES:
        raise ValueError("Unsupported sex value.")

    numeric_fields = ("age", "height_cm", "weight_kg", "budget_day", "time_per_session")
    for field in numeric_fields:
        normalized[field] = float(normalized[field]) if field != "age" else int(normalized[field])

    normalized["gym_days"] = int(normalized["gym_days"])
    normalized["weeks"] = int(normalized.get("weeks", 8))
    normalized["target_kg"] = float(normalized.get("target_kg", normalized["weight_kg"]))
    normalized["dietary_restrictions"] = list(normalized.get("dietary_restrictions", []))
    normalized["food_preferences_enjoy"] = list(normalized.get("food_preferences_enjoy", []))
    normalized["food_preferences_avoid"] = list(normalized.get("food_preferences_avoid", []))
    normalized["availability"] = normalize_availability(normalized.get("availability"))
    return normalized


def compute_nutrition_targets(profile: dict[str, Any]) -> dict[str, float]:
    sex = profile["sex"]
    age = profile["age"]
    height_cm = profile["height_cm"]
    weight_kg = profile["weight_kg"]
    goal = profile["goal"]

    if sex == "male":
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    activity_factor = {"beginner": 1.35, "intermediate": 1.50, "advanced": 1.65}.get(
        profile["fitness_level"], 1.45
    )
    maintenance_calories = bmr * activity_factor

    if goal == "weight_loss":
        calorie_min = max(1200, maintenance_calories - 550)
        calorie_max = maintenance_calories - 250
        protein_min = 1.8 * weight_kg
        fat_min = 0.6 * weight_kg
        carbs_target = max(100, (maintenance_calories * 0.40) / 4)
    elif goal == "muscle_gain":
        calorie_min = maintenance_calories + 150
        calorie_max = maintenance_calories + 400
        protein_min = 2.0 * weight_kg
        fat_min = 0.7 * weight_kg
        carbs_target = max(120, (maintenance_calories * 0.45) / 4)
    else:
        calorie_min = maintenance_calories - 50
        calorie_max = maintenance_calories + 50
        protein_min = 2.2 * weight_kg
        fat_min = 0.7 * weight_kg
        carbs_target = max(120, (maintenance_calories * 0.35) / 4)

    if profile.get("use_macro_override", False):
        override = profile.get("macro_targets", {})
        if override.get("protein_g") is not None:
            protein_min = float(override["protein_g"])
        if override.get("fat_g") is not None:
            fat_min = float(override["fat_g"])
        if override.get("carbs_g") is not None:
            carbs_target = float(override["carbs_g"])

    return {
        "bmr": bmr,
        "maintenance_calories": maintenance_calories,
        "calorie_min": calorie_min,
        "calorie_max": calorie_max,
        "protein_min": protein_min,
        "fat_min": fat_min,
        "carbs_target": carbs_target,
    }


def filter_foods_by_preferences(foods_df: pd.DataFrame, profile: dict[str, Any]) -> pd.DataFrame:
    df = foods_df.copy()
    restrictions = set(profile.get("dietary_restrictions", []))

    if "vegetarian" in restrictions:
        df = df[df["vegetarian"] == 1]
    if "vegan" in restrictions:
        df = df[df["vegan"] == 1]
    if "gluten_free" in restrictions:
        df = df[df["gluten_free"] == 1]
    if "dairy_free" in restrictions:
        df = df[df["dairy_free"] == 1]
    if "halal" in restrictions:
        df = df[df["halal"] == 1]

    avoid_categories = set(profile.get("food_preferences_avoid", []))
    if avoid_categories:
        df = df[~df["category"].isin(avoid_categories)]

    return df.copy()


def compute_exercise_metrics(exercises_df: pd.DataFrame, profile: dict[str, Any]) -> pd.DataFrame:
    df = exercises_df.copy()
    user_level = FITNESS_LEVEL_ORDER.get(profile["fitness_level"], 1)
    user_equipment = profile["equipment_access"]

    df = df[
        df["equipment_access"].apply(lambda equipment: equipment in ("all", user_equipment))
        & df["min_fitness_level"].apply(lambda level: FITNESS_LEVEL_ORDER.get(level, 1) <= user_level)
    ].copy()

    if df.empty:
        raise ValueError("No exercises remain after applying equipment and fitness filters.")

    time_per_session = profile["time_per_session"]
    weight_kg = profile["weight_kg"]

    df["duration_hours"] = np.where(
        df["exercise_type"] == "rest",
        0.0,
        np.minimum(df["duration_hours"], time_per_session),
    )
    df["calories_burned"] = df["met"] * weight_kg * df["duration_hours"]
    return df


def solve_nutrition(profile: dict[str, Any], foods_df: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, Any]]:
    budget_day = profile["budget_day"]
    params = compute_nutrition_targets(profile)
    df = filter_foods_by_preferences(foods_df, profile)

    if df.empty:
        raise ValueError(
            "No feasible food items remain after applying dietary restrictions and food avoidance preferences."
        )

    foods = df["food"].tolist()
    short_days = [short_day for short_day, _ in DAY_ORDER]

    calories = df.set_index("food")["calories_per_100g"].to_dict()
    protein = df.set_index("food")["protein_per_100g"].to_dict()
    carbs = df.set_index("food")["carbs_per_100g"].to_dict()
    fat = df.set_index("food")["fat_per_100g"].to_dict()
    price = df.set_index("food")["cost_per_100g"].to_dict()
    category = df.set_index("food")["category"].to_dict()
    enjoy_categories = set(profile.get("food_preferences_enjoy", []))
    lean_categories = {"lean_protein", "protein", "plant_protein", "dairy"}

    model = Model("fitopt_nutrition")
    model.Params.OutputFlag = 0

    grams = model.addVars(short_days, MEAL_SLOTS, foods, lb=0.0, vtype=GRB.CONTINUOUS, name="grams")

    total_cost_terms = []
    total_calorie_terms = []
    total_protein_terms = []
    total_fat_terms = []

    for day in short_days:
        day_calories = quicksum(calories[food] / 100.0 * grams[day, meal, food] for meal in MEAL_SLOTS for food in foods)
        day_protein = quicksum(protein[food] / 100.0 * grams[day, meal, food] for meal in MEAL_SLOTS for food in foods)
        day_carbs = quicksum(carbs[food] / 100.0 * grams[day, meal, food] for meal in MEAL_SLOTS for food in foods)
        day_fat = quicksum(fat[food] / 100.0 * grams[day, meal, food] for meal in MEAL_SLOTS for food in foods)
        day_cost = quicksum(price[food] / 100.0 * grams[day, meal, food] for meal in MEAL_SLOTS for food in foods)

        model.addConstr(day_calories >= params["calorie_min"], name=f"calorie_min_{day}")
        model.addConstr(day_calories <= params["calorie_max"], name=f"calorie_max_{day}")
        model.addConstr(day_protein >= params["protein_min"], name=f"protein_min_{day}")
        model.addConstr(day_fat >= params["fat_min"], name=f"fat_min_{day}")
        model.addConstr(day_carbs >= 0.6 * params["carbs_target"], name=f"carbs_min_{day}")
        model.addConstr(day_cost <= budget_day, name=f"budget_max_{day}")

        breakfast_calories = quicksum(calories[food] / 100.0 * grams[day, "Breakfast", food] for food in foods)
        lunch_calories = quicksum(calories[food] / 100.0 * grams[day, "Lunch", food] for food in foods)
        dinner_calories = quicksum(calories[food] / 100.0 * grams[day, "Dinner", food] for food in foods)
        snack_calories = quicksum(calories[food] / 100.0 * grams[day, "Snack", food] for food in foods)

        model.addConstr(breakfast_calories >= 0.15 * day_calories, name=f"breakfast_share_{day}")
        model.addConstr(lunch_calories >= 0.25 * day_calories, name=f"lunch_share_{day}")
        model.addConstr(dinner_calories >= 0.25 * day_calories, name=f"dinner_share_{day}")
        model.addConstr(snack_calories >= 0.05 * day_calories, name=f"snack_share_{day}")

        total_cost_terms.append(day_cost)
        total_calorie_terms.append(day_calories)
        total_protein_terms.append(day_protein)
        total_fat_terms.append(day_fat)

    total_weekly_cost = quicksum(total_cost_terms)
    total_weekly_calories = quicksum(total_calorie_terms)
    total_weekly_protein = quicksum(total_protein_terms)
    total_weekly_fat = quicksum(total_fat_terms)
    preference_bonus = quicksum(
        (1 if category[food] in enjoy_categories else 0) * grams[day, meal, food]
        for day in short_days
        for meal in MEAL_SLOTS
        for food in foods
    )
    lean_protein_bonus = quicksum(
        (1 if category[food] in lean_categories else 0) * protein[food] / 100.0 * grams[day, meal, food]
        for day in short_days
        for meal in MEAL_SLOTS
        for food in foods
    )

    if profile["goal"] == "weight_loss":
        model.setObjective(total_weekly_calories - 0.01 * preference_bonus, GRB.MINIMIZE)
    elif profile["goal"] == "muscle_gain":
        model.setObjective(total_weekly_protein + 0.01 * preference_bonus, GRB.MAXIMIZE)
    else:
        model.setObjective(
            2.0 * total_weekly_protein + 0.75 * lean_protein_bonus - 0.5 * total_weekly_fat + 0.01 * preference_bonus,
            GRB.MAXIMIZE,
        )

    model.optimize()
    if model.Status != GRB.OPTIMAL:
        raise ValueError("Nutrition model infeasible or not solved optimally.")

    result_rows: list[dict[str, Any]] = []
    for short_day, long_day in DAY_ORDER:
        for meal in MEAL_SLOTS:
            for food in foods:
                grams_value = grams[short_day, meal, food].X
                if grams_value <= 1e-6:
                    continue
                result_rows.append(
                    {
                        "day": long_day,
                        "meal": meal,
                        "food": food,
                        "grams": round(grams_value, 1),
                        "calories": round(calories[food] / 100.0 * grams_value, 1),
                        "protein": round(protein[food] / 100.0 * grams_value, 1),
                        "carbs": round(carbs[food] / 100.0 * grams_value, 1),
                        "fat": round(fat[food] / 100.0 * grams_value, 1),
                        "cost": round(price[food] / 100.0 * grams_value, 2),
                    }
                )

    result_df = pd.DataFrame(result_rows)
    if result_df.empty:
        raise ValueError("Nutrition model returned an empty meal plan.")

    daily_summary = result_df.groupby("day", as_index=False)[["calories", "protein", "carbs", "fat", "cost"]].sum()
    summary = {
        "daily_calories": round(float(daily_summary["calories"].mean()), 1),
        "protein": round(float(daily_summary["protein"].mean()), 1),
        "carbs": round(float(daily_summary["carbs"].mean()), 1),
        "fat": round(float(daily_summary["fat"].mean()), 1),
        "daily_cost": round(float(daily_summary["cost"].mean()), 2),
        "weekly_food_cost": round(float(daily_summary["cost"].sum()), 2),
        "maintenance_calories": round(params["maintenance_calories"], 1),
        "macro_targets": {
            "protein_min": round(params["protein_min"], 1),
            "carbs_target": round(params["carbs_target"], 1),
            "fat_min": round(params["fat_min"], 1),
        },
        "model_stats": {"variables": int(model.NumVars), "constraints": int(model.NumConstrs)},
    }
    return result_df.sort_values(["day", "meal", "calories"], ascending=[True, True, False]).reset_index(drop=True), summary


def solve_workout(profile: dict[str, Any], exercises_df: pd.DataFrame) -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    df = compute_exercise_metrics(exercises_df, profile)
    goal = profile["goal"]
    gym_days = profile["gym_days"]
    availability = profile["availability"]

    if goal == "weight_loss":
        df = df.sort_values(["exercise_type", "calories_burned"], ascending=[True, False])
    elif goal == "muscle_gain":
        df = df.sort_values(["exercise_type", "volume_score"], ascending=[True, False])
    else:
        df["recomp_score"] = 3.0 * df["volume_score"] + 0.15 * df["calories_burned"] - 0.05 * df["duration_hours"]
        df["resistance_priority"] = (~df["exercise_type"].isin(RESISTANCE_TYPES)).astype(int)
        df = df.sort_values(["resistance_priority", "exercise_type", "recomp_score"], ascending=[True, True, False])

    df = df.groupby("exercise_type", as_index=False).first()
    short_days = [short_day for short_day, _ in DAY_ORDER]
    exercises = df["exercise_type"].tolist()

    calories_burned = df.set_index("exercise_type")["calories_burned"].to_dict()
    volume_score = df.set_index("exercise_type")["volume_score"].to_dict()
    duration_hours = df.set_index("exercise_type")["duration_hours"].to_dict()
    recovery_days = df.set_index("exercise_type")["recovery_days"].to_dict()
    exercise_name = df.set_index("exercise_type")["exercise_name"].to_dict()

    model = Model("fitopt_workout")
    model.Params.OutputFlag = 0
    assign = model.addVars(short_days, exercises, vtype=GRB.BINARY, name="assign")

    for day in short_days:
        model.addConstr(quicksum(assign[day, exercise] for exercise in exercises) == 1, name=f"one_activity_{day}")

    non_rest_exercises = [exercise for exercise in exercises if exercise != "rest"]
    resistance_exercises = [exercise for exercise in exercises if exercise in RESISTANCE_TYPES]
    cardio_exercises = [exercise for exercise in exercises if exercise == "cardio"]

    for day in short_days:
        if availability.get(day, 0) == 0:
            for exercise in non_rest_exercises:
                model.addConstr(assign[day, exercise] == 0, name=f"unavailable_{day}_{exercise}")

    model.addConstr(
        quicksum(assign[day, exercise] for day in short_days for exercise in non_rest_exercises) <= gym_days,
        name="gym_days_cap",
    )

    for exercise in non_rest_exercises:
        recovery_window = int(recovery_days.get(exercise, 0))
        if recovery_window <= 0:
            continue
        window_size = recovery_window + 1
        for start in range(len(short_days) - recovery_window):
            window_days = short_days[start:start + window_size]
            model.addConstr(
                quicksum(assign[day, exercise] for day in window_days) <= 1,
                name=f"recovery_{exercise}_{short_days[start]}",
            )

    if goal == "body_recomposition" and resistance_exercises:
        available_training_days = sum(availability.get(day, 0) for day in short_days)
        target_resistance_days = min(gym_days, available_training_days, 3)
        model.addConstr(
            quicksum(assign[day, exercise] for day in short_days for exercise in resistance_exercises) >= target_resistance_days,
            name="body_recomposition_resistance_floor",
        )
        if cardio_exercises:
            model.addConstr(
                quicksum(assign[day, exercise] for day in short_days for exercise in cardio_exercises) <= 1,
                name="body_recomposition_cardio_cap",
            )

    if goal == "weight_loss":
        model.setObjective(
            quicksum(calories_burned[exercise] * assign[day, exercise] for day in short_days for exercise in exercises),
            GRB.MAXIMIZE,
        )
    elif goal == "muscle_gain":
        model.setObjective(
            quicksum(volume_score[exercise] * assign[day, exercise] for day in short_days for exercise in exercises),
            GRB.MAXIMIZE,
        )
    else:
        model.setObjective(
            quicksum(
                (3.0 * volume_score[exercise] + 0.10 * calories_burned[exercise] - 0.05 * duration_hours[exercise])
                * assign[day, exercise]
                for day in short_days
                for exercise in exercises
            ),
            GRB.MAXIMIZE,
        )

    model.optimize()
    if model.Status != GRB.OPTIMAL:
        raise ValueError("Workout model infeasible or not solved optimally.")

    schedule: dict[str, dict[str, Any]] = {}
    total_burn = 0.0
    total_hours = 0.0
    active_days = 0

    for short_day in short_days:
        chosen_exercise = next((exercise for exercise in exercises if assign[short_day, exercise].X > 0.5), "rest")
        schedule[short_day] = {
            "type": chosen_exercise,
            "exercise_name": exercise_name.get(chosen_exercise, chosen_exercise),
            "duration_hours": float(duration_hours[chosen_exercise]),
            "calories_burned": float(calories_burned[chosen_exercise]),
        }
        total_burn += calories_burned[chosen_exercise]
        total_hours += duration_hours[chosen_exercise]
        if chosen_exercise != "rest":
            active_days += 1

    summary = {
        "weekly_calories_burned": round(total_burn, 1),
        "weekly_gym_hours": round(total_hours, 2),
        "active_days": active_days,
        "model_stats": {"variables": int(model.NumVars), "constraints": int(model.NumConstrs)},
    }
    return schedule, summary


def build_projection(weight_kg: float, target_kg: float, weeks_to_goal: float) -> list[dict[str, float]]:
    horizon = max(1, int(math.ceil(weeks_to_goal)))
    projection: list[dict[str, float]] = []
    for week in range(1, horizon + 1):
        progress = min(1.0, week / max(weeks_to_goal, 1e-6))
        projected_weight = weight_kg + progress * (target_kg - weight_kg)
        projection.append({"week": week, "weight_kg": round(projected_weight, 2)})
    return projection


def estimate_weeks_to_goal(
    profile: dict[str, Any],
    nutrition_summary: dict[str, Any],
    workout_summary: dict[str, Any],
) -> float:
    weight_kg = profile["weight_kg"]
    target_kg = profile["target_kg"]
    delta_kg = target_kg - weight_kg
    if abs(delta_kg) < 1e-9:
        return 0.0

    goal = profile["goal"]
    daily_calories = nutrition_summary["daily_calories"]
    maintenance_calories = nutrition_summary["maintenance_calories"]
    daily_burn = workout_summary["weekly_calories_burned"] / 7.0

    if goal == "weight_loss":
        daily_change = max(0.0, maintenance_calories + daily_burn - daily_calories)
        if daily_change <= 0:
            return float(profile.get("weeks", 8))
        return (abs(delta_kg) * 7700) / (7 * daily_change)

    if goal == "muscle_gain":
        daily_change = max(0.0, daily_calories - maintenance_calories)
        if daily_change <= 0:
            return float(profile.get("weeks", 8))
        return (abs(delta_kg) * 7700) / (7 * daily_change)

    if delta_kg <= 0:
        weekly_change_kg = max(0.08, (daily_burn * 7 / 7700) * 0.75)
        return abs(delta_kg) / weekly_change_kg

    weekly_change_kg = 0.12
    return abs(delta_kg) / weekly_change_kg


def build_meal_plan_payload(meal_plan_df: pd.DataFrame) -> dict[str, list[dict[str, Any]]]:
    meal_plan: dict[str, list[dict[str, Any]]] = {long_day: [] for _, long_day in DAY_ORDER}
    for long_day in meal_plan:
        day_df = meal_plan_df[meal_plan_df["day"] == long_day].copy()
        if day_df.empty:
            continue
        day_df = day_df.sort_values(["meal", "calories"], ascending=[True, False]).reset_index(drop=True)
        meal_plan[long_day] = [
            {
                "meal": row["meal"],
                "food": humanize_name(row["food"]),
                "grams": float(row["grams"]),
                "calories": float(row["calories"]),
                "protein": float(row["protein"]),
                "carbs": float(row["carbs"]),
                "fat": float(row["fat"]),
            }
            for _, row in day_df.iterrows()
        ]
    return meal_plan


def workout_prescription(goal: str, exercise_type: str, duration_hours: float) -> dict[str, Any]:
    duration_min = int(round(duration_hours * 60))
    if exercise_type == "cardio":
        return {"sets": 1, "reps": 1, "duration_min": duration_min, "muscle_group": "cardio"}

    if goal == "weight_loss":
        sets, reps = 3, 12
    elif goal == "muscle_gain":
        sets, reps = 4, 8
    else:
        sets, reps = 4, 10

    muscle_group = "lower_body" if exercise_type == "legs" else "upper_body"
    return {"sets": sets, "reps": reps, "duration_min": duration_min, "muscle_group": muscle_group}


def build_workout_schedule_payload(
    workout_schedule: dict[str, dict[str, Any]],
    profile: dict[str, Any],
) -> dict[str, list[dict[str, Any]]]:
    payload: dict[str, list[dict[str, Any]]] = {long_day: [] for _, long_day in DAY_ORDER}
    for short_day, long_day in DAY_ORDER:
        entry = workout_schedule.get(short_day, {"type": "rest"})
        if entry.get("type") == "rest":
            payload[long_day] = []
            continue

        prescription = workout_prescription(
            profile["goal"],
            entry["type"],
            float(entry["duration_hours"]),
        )
        payload[long_day] = [
            {
                "exercise": humanize_name(entry["exercise_name"]),
                **prescription,
            }
        ]
    return payload


def run_sensitivity_extra_gym_day(
    profile: dict[str, Any],
    foods_df: pd.DataFrame,
    exercises_df: pd.DataFrame,
) -> dict[str, Any]:
    baseline = run_fitopt_pipeline(profile, foods_df, exercises_df, include_insights=False)
    sensitivity_profile = copy.deepcopy(profile)
    max_available_days = sum(profile["availability"].values())
    sensitivity_profile["gym_days"] = min(profile["gym_days"] + 1, max_available_days)
    sensitivity = run_fitopt_pipeline(sensitivity_profile, foods_df, exercises_df, include_insights=False)
    return {
        "base_gym_days": profile["gym_days"],
        "new_gym_days": sensitivity_profile["gym_days"],
        "base_weeks_to_goal": baseline["summary"]["weeks_to_goal"],
        "new_weeks_to_goal": sensitivity["summary"]["weeks_to_goal"],
        "base_weekly_gym_hours": baseline["summary"]["weekly_gym_hours"],
        "new_weekly_gym_hours": sensitivity["summary"]["weekly_gym_hours"],
    }


def build_insights(
    profile: dict[str, Any],
    payload: dict[str, Any],
    nutrition_summary: dict[str, Any],
    foods_df: pd.DataFrame,
    exercises_df: pd.DataFrame,
) -> list[dict[str, str]]:
    insights: list[dict[str, str]] = []
    sensitivity = run_sensitivity_extra_gym_day(profile, foods_df, exercises_df)
    if sensitivity["new_gym_days"] > sensitivity["base_gym_days"]:
        delta_weeks = round(sensitivity["new_weeks_to_goal"] - sensitivity["base_weeks_to_goal"], 2)
        insights.append(
            {
                "text": (
                    f"Adding one more gym day shifts weekly gym time from "
                    f"{sensitivity['base_weekly_gym_hours']}h to {sensitivity['new_weekly_gym_hours']}h "
                    f"and changes the goal timeline by {delta_weeks} weeks."
                )
            }
        )

    budget_headroom = round(profile["budget_day"] - nutrition_summary["daily_cost"], 2)
    insights.append(
        {
            "text": (
                f"The plan uses {nutrition_summary['daily_cost']} of the {profile['budget_day']} daily food budget, "
                f"leaving {budget_headroom} in headroom for substitutions or variety."
            )
        }
    )

    if profile["goal"] == "body_recomposition":
        resistance_days = sum(1 for day in payload["workout_schedule"].values() if day and day[0]["muscle_group"] != "cardio")
        insights.append(
            {
                "text": (
                    f"Body recomposition keeps calories at maintenance while pushing protein to "
                    f"{nutrition_summary['protein']}g/day and prioritising {resistance_days} resistance sessions each week."
                )
            }
        )
    else:
        insights.append(
            {
                "text": (
                    f"Protein lands at {nutrition_summary['protein']}g/day against a minimum target of "
                    f"{nutrition_summary['macro_targets']['protein_min']}g/day, giving the plan room to preserve or build lean mass."
                )
            }
        )

    return insights[:3]


def run_fitopt_pipeline(
    profile: dict[str, Any],
    foods_df: pd.DataFrame | None = None,
    exercises_df: pd.DataFrame | None = None,
    include_insights: bool = True,
) -> dict[str, Any]:
    normalized_profile = normalize_profile(profile)
    foods_df = get_foods_df() if foods_df is None else foods_df.copy()
    exercises_df = get_exercises_df() if exercises_df is None else exercises_df.copy()

    meal_plan_df, nutrition_summary = solve_nutrition(normalized_profile, foods_df)
    workout_schedule, workout_summary = solve_workout(normalized_profile, exercises_df)
    weeks_to_goal = round(estimate_weeks_to_goal(normalized_profile, nutrition_summary, workout_summary), 2)

    payload = {
        "summary": {
            "weeks_to_goal": weeks_to_goal,
            "daily_calories": round(nutrition_summary["daily_calories"], 1),
            "weekly_gym_hours": round(workout_summary["weekly_gym_hours"], 2),
            "weekly_food_cost": round(nutrition_summary["weekly_food_cost"], 2),
        },
        "projection": build_projection(
            normalized_profile["weight_kg"],
            normalized_profile["target_kg"],
            weeks_to_goal,
        ),
        "meal_plan": build_meal_plan_payload(meal_plan_df),
        "workout_schedule": build_workout_schedule_payload(workout_schedule, normalized_profile),
    }
    if include_insights:
        payload["insights"] = build_insights(
            normalized_profile,
            payload,
            nutrition_summary,
            foods_df,
            exercises_df,
        )
    return payload


def safe_run_fitopt(
    profile: dict[str, Any],
    foods_df: pd.DataFrame | None = None,
    exercises_df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    try:
        return {"success": True, "data": run_fitopt_pipeline(profile, foods_df, exercises_df)}
    except Exception as exc:
        return {
            "success": False,
            "error": str(exc),
            "hint": (
                "The model may be infeasible because the calorie, protein, budget, equipment, "
                "availability, or dietary-preference constraints are too restrictive."
            ),
        }


def get_model_counts(
    profile: dict[str, Any] | None = None,
    foods_df: pd.DataFrame | None = None,
    exercises_df: pd.DataFrame | None = None,
) -> dict[str, int]:
    normalized_profile = normalize_profile(profile)
    foods_df = get_foods_df() if foods_df is None else foods_df.copy()
    exercises_df = get_exercises_df() if exercises_df is None else exercises_df.copy()
    _, nutrition_summary = solve_nutrition(normalized_profile, foods_df)
    _, workout_summary = solve_workout(normalized_profile, exercises_df)
    nutrition_vars = nutrition_summary["model_stats"]["variables"]
    nutrition_constraints = nutrition_summary["model_stats"]["constraints"]
    workout_vars = workout_summary["model_stats"]["variables"]
    workout_constraints = workout_summary["model_stats"]["constraints"]
    return {
        "nutrition_variables": nutrition_vars,
        "nutrition_constraints": nutrition_constraints,
        "workout_variables": workout_vars,
        "workout_constraints": workout_constraints,
        "total_variables": nutrition_vars + workout_vars,
        "total_constraints": nutrition_constraints + workout_constraints,
    }

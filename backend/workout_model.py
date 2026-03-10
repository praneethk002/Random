from __future__ import annotations

import csv
from typing import Any

from config import DATA_DIR

DAY_ORDER = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")


def _exercise_table() -> list[dict[str, Any]]:
    with (DATA_DIR / "exercises.csv").open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        row["duration_hours"] = float(row["duration_hours"])
        row["calories_per_hour"] = float(row["calories_per_hour"])
    return rows


def solve_workout(
    goal: str,
    weight_kg: float,
    gym_days: int,
    time_per_session: float,
    availability: dict[str, int] | None = None,
) -> dict[str, dict[str, Any]]:
    exercises = {row["exercise"]: row for row in _exercise_table()}
    availability = availability or {day: 1 for day in DAY_ORDER}
    available_days = [day for day in DAY_ORDER if availability.get(day, 0) == 1]
    selected_days = available_days[: max(0, min(gym_days, len(available_days)))]

    schedule: dict[str, dict[str, Any]] = {}
    lift_cycle = ["upper_body_compound", "lower_body_compound"]
    cardio_choice = "cycling" if goal == "weight_loss" else "treadmill_walk"

    for idx, day in enumerate(DAY_ORDER):
        if day not in selected_days:
            schedule[day] = {"type": "rest", "duration": 0.0, "calories_burned": 0.0}
            continue
        name = cardio_choice if idx % 3 == 0 else lift_cycle[idx % 2]
        row = exercises[name]
        duration = min(row["duration_hours"], time_per_session)
        schedule[day] = {
            "type": row["exercise_type"],
            "duration": round(duration, 2),
            "calories_burned": round(row["calories_per_hour"] * duration, 1),
        }
    return schedule

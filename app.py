from __future__ import annotations

from flask import Flask, jsonify, request

from fitness_backend import (
    VALID_GOALS,
    build_default_profile,
    get_foods_df,
    get_exercises_df,
    get_model_counts,
    normalize_profile,
    run_fitopt_pipeline,
    run_sensitivity_extra_gym_day,
)

app = Flask(__name__)


@app.get("/api/model-metadata")
def model_metadata():
    counts_by_goal = {}
    for goal in VALID_GOALS:
        profile = build_default_profile()
        profile["goal"] = goal
        counts_by_goal[goal] = get_model_counts(profile)
    return jsonify(
        {
            "valid_goals": list(VALID_GOALS),
            "model_counts": counts_by_goal[VALID_GOALS[0]],
            "model_counts_by_goal": counts_by_goal,
        }
    )


@app.post("/api/fitness-plan")
@app.post("/api/optimize")
@app.post("/api/optimise")
def optimize_fitness_plan():
    payload = request.get_json(silent=True) or {}
    try:
        result = run_fitopt_pipeline(payload)
        return jsonify(result)
    except ValueError as exc:
        return (
            jsonify(
                {
                    "error": str(exc),
                    "valid_goals": list(VALID_GOALS),
                }
            ),
            400,
        )
    except Exception as exc:
        return jsonify({"error": "internal_server_error", "detail": str(exc)}), 500


@app.post("/api/sensitivity")
def sensitivity():
    payload = request.get_json(silent=True) or {}
    try:
        profile = normalize_profile(payload)
        result = run_sensitivity_extra_gym_day(profile, get_foods_df(), get_exercises_df())
        return jsonify({"weeks_to_goal": result["new_weeks_to_goal"]})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": "internal_server_error", "detail": str(exc)}), 500


if __name__ == "__main__":
    app.run(debug=True)

from __future__ import annotations

from flask import Flask, jsonify, request

from fitness_backend import VALID_GOALS, build_default_profile, get_model_counts, run_fitopt_pipeline

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


if __name__ == "__main__":
    app.run(debug=True)

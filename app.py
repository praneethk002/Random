from __future__ import annotations

import traceback
from flask import Flask, jsonify, request
from flask_cors import CORS

from fitness_backend import VALID_GOALS, build_default_profile, get_model_counts, run_fitopt_pipeline

app = Flask(__name__)
CORS(app)


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

    if 'gym_days' in payload and isinstance(payload['gym_days'], list):
        payload['gym_days'] = len(payload['gym_days'])
    if 'start_weight_kg' in payload:
        payload['weight_kg'] = payload.pop('start_weight_kg')
    if 'target_weight_kg' in payload:
        payload['target_kg'] = payload.pop('target_weight_kg')
    if 'height_cm' in payload:
        payload['height'] = payload.pop('height_cm')
    if 'session_length' in payload:
        payload['session_duration_min'] = payload.pop('session_length')

    try:
        result = run_fitopt_pipeline(payload)
        return jsonify(result)
    except ValueError as exc:
        traceback.print_exc()
        return jsonify({"error": str(exc), "valid_goals": list(VALID_GOALS)}), 400
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": "internal_server_error", "detail": str(exc)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)

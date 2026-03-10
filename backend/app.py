from __future__ import annotations

from flask import Flask, jsonify, request

from fitness_backend import run_fitopt_pipeline, run_sensitivity

app = Flask(__name__)


@app.post("/api/optimise")
@app.post("/api/optimize")
@app.post("/api/fitness-plan")
def optimise() -> tuple:
    payload = request.get_json(silent=True) or {}
    try:
        return jsonify(run_fitopt_pipeline(payload)), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # pragma: no cover
        return jsonify({"error": "internal_server_error", "detail": str(exc)}), 500


@app.post("/api/sensitivity")
def sensitivity() -> tuple:
    payload = request.get_json(silent=True) or {}
    try:
        return jsonify(run_sensitivity(payload)), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # pragma: no cover
        return jsonify({"error": "internal_server_error", "detail": str(exc)}), 500


if __name__ == "__main__":
    app.run(debug=True)

from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

SOLVER_NAME = os.getenv("FITOPT_SOLVER", "heuristic")
SOLVER_TIME_LIMIT_SECONDS = float(os.getenv("FITOPT_SOLVER_TIME_LIMIT_SECONDS", "5"))

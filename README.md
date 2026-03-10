# FitOpt

FitOpt is split into a backend API and a Vite/React frontend.

## Repository layout

- `backend/` – Flask API and optimisation logic
- `frontend/` – React + TypeScript client
- `docs/` – reference material

## Run backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend routes:
- `POST /api/optimise`
- `POST /api/sensitivity`

Example `/api/optimise` payload:

```json
{
  "goal": "weight_loss",
  "weight_kg": 80,
  "target_kg": 75,
  "weeks": 8,
  "budget_day": 10,
  "gym_days": 4,
  "time_per_session": 1,
  "dietary_restrictions": ["dairy_free"],
  "availability": {"Mon":1,"Tue":1,"Wed":1,"Thu":0,"Fri":1,"Sat":0,"Sun":0}
}
```

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

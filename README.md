# AgriVision

AI-assisted crop/plant health monitoring MVP.

## Problem statement

Farmers can miss early signs of crop stress until it's visible from a distance — by then,
yield loss may already be underway.

## Solution

Upload a leaf/plant photo and AgriVision estimates a health score from leaf colour,
buckets it into healthy/moderate-stress/severe-stress, and tracks checks across a farm
dashboard over time — always pointing to a professional for actual treatment decisions.

## Features

- Leaf health estimate from a single photo
- Condition classification (healthy / moderate stress / severe stress)
- Farm-level dashboard and check history
- CSV export
- Demo mode using bundled sample leaf photos

## Architecture

```text
frontend (React/Vite/TS/Tailwind)  ->  backend (FastAPI)  ->  SQLite
                                              |
                            HSV colour-fraction stats + trained MobileNetV2
                              condition classifier (healthy/moderate/severe)
```

## Technology stack

Python, FastAPI, SQLAlchemy, SQLite, OpenCV, PyTorch/TorchVision; React, TypeScript, Vite,
Tailwind CSS.

## Folder structure

```text
agrivision/
├── backend/
│   ├── app/
│   │   └── ml_model/  # Trained TorchScript classifier (agrivision_classifier.pt)
│   ├── demo/           # Bundled sample leaf photos
│   └── tests/
├── frontend/
│   └── src/              # Landing page + dashboard
├── docker-compose.yml
└── README.md
```

## Installation

```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

```bash
cd frontend && npm install
```

## Environment variables

`UPLOAD_DIR`, `MAX_UPLOAD_MB`, `CORS_ORIGINS` — see `backend/.env.example`.

## Running locally

```bash
# Terminal 1
cd backend && venv\Scripts\activate && uvicorn app.main:app --reload
# Terminal 2
cd frontend && npm run dev
```

Open http://localhost:5173. Docker: `docker compose up --build`.

## Demo instructions

Click **Run demo sample** — analyzes one of the bundled sample leaf photos (healthy and
stressed examples, Wikimedia Commons, CC-licensed). Upload your own plant photo to try it
on other footage.

## API documentation

Docs at `/docs`. Key endpoints: `POST /api/analyze`, `POST /api/analyze/demo`,
`GET /api/checks`, `GET /api/checks/export`, `GET /api/dashboard/summary`.

## Database

SQLite: `plant_checks` (health score, condition, green/stressed %, recommendation).

## Security considerations

- **API key required on every endpoint except `/api/health`.** Set `API_KEY` (backend
  `.env`) and `VITE_API_KEY` (frontend `.env`) to the same value before deploying anywhere
  reachable outside your own machine — the default (`dev-local-key-change-me`) is for
  local development only. Single-tenant "licensed instance" model, not per-user accounts.
- Rate limiting (30 req/60s/IP) on the API.
- Upload size/type validated server-side, CORS restricted, no secrets in source.

## Privacy considerations

Plant photos aren't expected to contain personal data; avoid including identifiable
people or property boundaries in frame if privacy is a concern.

## Limitations — important

- **The "condition" label comes from a trained MobileNetV2 classifier** (frozen ImageNet
  backbone + trained classifier head), fine-tuned on ~590 labeled tomato-leaf photos from
  PlantVillage (healthy / early blight / late blight, mapped to
  healthy/moderate_stress/severe_stress), reaching **96.6% held-out validation accuracy**.
  **It was trained on tomato leaves only** — accuracy on other crop species is unverified
  and likely lower; treat results for non-tomato plants with extra caution. It is still
  not a disease-specific diagnosis tool: it doesn't identify *which* disease or pest is
  present, only an overall stress-severity bucket. The green_pct/stressed_pct/health_score
  numbers on the dashboard still come from the original HSV colour-fraction heuristic.
- **Domain shift is real and was caught by testing against this project's own demo
  photos, not just the held-out validation set.** PlantVillage photos are isolated leaves
  against a plain background — a controlled lab-photography style. Tested against this
  app's bundled demo photos (different framing/background/lighting), the model
  misclassified a 99.5%-green healthy-leaf photo as "severe_stress". A guardrail in
  `analyze_plant()` now forces "healthy" whenever green_pct ≥ 95%, since real severe
  stress necessarily reduces green coverage in the model's own training data — but this
  is a narrow patch for the most extreme failure case, not a fix for domain shift in
  general. Expect degraded real-world accuracy versus the 96.6% validation number,
  especially on photos that don't resemble PlantVillage's framing.
- **Recommendations are informational only.** This system does not and must not recommend
  specific pesticides or chemical treatments — every result explicitly directs the user to
  consult a qualified agricultural professional.
- Lighting, camera white-balance and photo angle all affect the colour measurement — the
  same plant photographed differently can score differently.

## Business model

**Target customers**: small farmers, commercial farms, agricultural cooperatives,
agricultural consultants, nurseries.

**Revenue**: farmer subscription, farm-wide subscription, agricultural analytics package,
B2B licensing for cooperatives.

## Future improvements

- Train a real disease-classification model (e.g. on PlantVillage) for actual diagnosis
- Per-plant tracking over time (not just per-photo)
- Integration with weather/soil data for richer context
- Multi-language support for smallholder farmers

## Screenshots

Run locally (see "Running locally") and click **Run demo sample** on `/app`.

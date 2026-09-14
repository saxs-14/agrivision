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
                                     HSV green-vs-stressed colour-fraction
                                     analysis (no trained model)
```

## Technology stack

Python, FastAPI, SQLAlchemy, SQLite, OpenCV; React, TypeScript, Vite, Tailwind CSS.

## Folder structure

```text
agrivision/
├── backend/
│   ├── app/          # FastAPI app, analysis heuristic
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

Upload size/type validated server-side, CORS restricted, no secrets in source. No admin
auth in this MVP.

## Privacy considerations

Plant photos aren't expected to contain personal data; avoid including identifiable
people or property boundaries in frame if privacy is a concern.

## Limitations — important

- **This is a colour-fraction heuristic (green vs. yellow/brown leaf area in HSV space),
  not a disease-specific classifier.** It cannot identify *which* disease or pest is
  present, only that leaf colour deviates from healthy green. A production system needs a
  model trained on a labeled plant-disease dataset (e.g. PlantVillage) for actual
  diagnosis.
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

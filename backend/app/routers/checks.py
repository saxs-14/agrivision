import csv
import glob
import io
import os
import random
import cv2
import numpy as np
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database import get_db
from app.models import PlantCheck
from app.schemas import PlantCheckOut, DashboardSummary
from app.config import settings
from app.analysis import analyze_plant

router = APIRouter(prefix="/api", tags=["checks"])

DEMO_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "demo")


def _persist(db, filename, farm_name, result):
    check = PlantCheck(
        source_filename=filename, farm_name=farm_name, health_score=result["health_score"],
        condition=result["condition"], green_pct=result["green_pct"],
        stressed_pct=result["stressed_pct"], recommendation=result["recommendation"],
    )
    db.add(check)
    db.commit()
    db.refresh(check)
    return check


@router.post("/analyze", response_model=PlantCheckOut)
async def analyze(
    file: UploadFile = File(...),
    farm_name: Optional[str] = Form(default=None),
    db: Session = Depends(get_db),
):
    contents = await file.read()
    if len(contents) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    img_array = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    result = analyze_plant(frame)
    return _persist(db, file.filename, farm_name, result)


@router.post("/analyze/demo", response_model=PlantCheckOut)
def analyze_demo(db: Session = Depends(get_db)):
    samples = glob.glob(os.path.join(DEMO_DIR, "*.jpg")) + glob.glob(os.path.join(DEMO_DIR, "*.png"))
    if not samples:
        raise HTTPException(status_code=404, detail="No demo images found on server")
    path = random.choice(samples)
    frame = cv2.imread(path)
    result = analyze_plant(frame)
    return _persist(db, os.path.basename(path), "Demo farm", result)


@router.get("/checks", response_model=List[PlantCheckOut])
def list_checks(limit: int = 200, db: Session = Depends(get_db)):
    return db.query(PlantCheck).order_by(PlantCheck.created_at.desc()).limit(limit).all()


@router.get("/checks/export")
def export_checks(db: Session = Depends(get_db)):
    checks = db.query(PlantCheck).order_by(PlantCheck.created_at.desc()).all()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["id", "filename", "farm", "health_score", "condition", "green_pct", "stressed_pct", "created_at"])
    for c in checks:
        writer.writerow([c.id, c.source_filename, c.farm_name, c.health_score, c.condition, c.green_pct, c.stressed_pct, c.created_at])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=agrivision_checks.csv"},
    )


@router.get("/dashboard/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db)):
    total = db.query(func.count(PlantCheck.id)).scalar() or 0
    avg_score = db.query(func.avg(PlantCheck.health_score)).scalar() or 0.0
    healthy = db.query(func.count(PlantCheck.id)).filter(PlantCheck.condition == "healthy").scalar() or 0
    stressed = db.query(func.count(PlantCheck.id)).filter(PlantCheck.condition != "healthy").scalar() or 0
    return DashboardSummary(total_checks=total, avg_health_score=round(avg_score, 1), healthy_count=healthy, stressed_count=stressed)

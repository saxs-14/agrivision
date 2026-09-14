from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PlantCheckOut(BaseModel):
    id: int
    source_filename: str
    farm_name: Optional[str]
    health_score: float
    condition: str
    green_pct: float
    stressed_pct: float
    recommendation: str
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    total_checks: int
    avg_health_score: float
    healthy_count: int
    stressed_count: int

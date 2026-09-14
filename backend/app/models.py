from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime, timezone
from app.database import Base


class PlantCheck(Base):
    __tablename__ = "plant_checks"

    id = Column(Integer, primary_key=True)
    source_filename = Column(String)
    farm_name = Column(String, nullable=True)
    health_score = Column(Float)  # 0-100, higher is healthier
    condition = Column(String)    # healthy | moderate_stress | severe_stress
    green_pct = Column(Float)
    stressed_pct = Column(Float)
    recommendation = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

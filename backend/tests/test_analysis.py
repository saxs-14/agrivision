import numpy as np
from app.analysis import analyze_plant


def test_analyze_plant_all_green_is_healthy():
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    frame[:] = (40, 160, 40)  # BGR green
    result = analyze_plant(frame)
    assert result["condition"] == "healthy"
    assert result["health_score"] > 70


def test_analyze_plant_all_brown_is_stressed():
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    frame[:] = (20, 90, 140)  # BGR brownish
    result = analyze_plant(frame)
    assert result["condition"] in ("moderate_stress", "severe_stress")


def test_analyze_plant_recommendation_mentions_professional():
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    frame[:] = (40, 160, 40)
    result = analyze_plant(frame)
    assert "professional" in result["recommendation"].lower()

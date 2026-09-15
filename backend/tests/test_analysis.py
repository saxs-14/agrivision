import numpy as np
from app.analysis import analyze_plant, classify_condition


def test_classify_condition_thresholds():
    assert classify_condition(90) == "healthy"
    assert classify_condition(55) == "moderate_stress"
    assert classify_condition(10) == "severe_stress"


def test_analyze_plant_no_plant_colour_is_severe_stress():
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    frame[:] = (200, 0, 0)  # BGR blue - not plant-coloured at all
    result = analyze_plant(frame)
    assert result["condition"] == "severe_stress"
    assert result["health_score"] == 0.0


def test_analyze_plant_returns_valid_condition_and_stats():
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    frame[:] = (40, 160, 40)  # BGR green
    result = analyze_plant(frame)
    assert result["condition"] in ("healthy", "moderate_stress", "severe_stress")
    assert 0 <= result["green_pct"] <= 100
    assert 0 <= result["stressed_pct"] <= 100


def test_analyze_plant_recommendation_mentions_professional():
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    frame[:] = (40, 160, 40)
    result = analyze_plant(frame)
    assert "professional" in result["recommendation"].lower()

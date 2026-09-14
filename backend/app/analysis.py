"""
Plant health estimate via HSV colour-fraction analysis (no trained model):
what fraction of the leaf/plant area is healthy green vs. yellow/brown/black
(a colour-based proxy for stress or disease that's commonly used as a
teaching baseline before moving to a trained classifier). See README
"Limitations" - this does NOT diagnose a specific disease and must never be
used to guide pesticide/chemical treatment decisions.
"""
import cv2
import numpy as np

GREEN_RANGE = ((30, 40, 40), (90, 255, 255))
YELLOW_BROWN_RANGE = ((10, 40, 30), (30, 255, 220))


def analyze_plant(frame: np.ndarray) -> dict:
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    green_mask = cv2.inRange(hsv, np.array(GREEN_RANGE[0]), np.array(GREEN_RANGE[1]))
    stressed_mask = cv2.inRange(hsv, np.array(YELLOW_BROWN_RANGE[0]), np.array(YELLOW_BROWN_RANGE[1]))

    plant_mask = cv2.bitwise_or(green_mask, stressed_mask)
    plant_px = int((plant_mask > 0).sum())

    if plant_px == 0:
        # no plant-like colour detected at all (e.g. background-only photo)
        return {
            "health_score": 0.0, "condition": "severe_stress",
            "green_pct": 0.0, "stressed_pct": 0.0,
            "recommendation": _recommend("severe_stress"),
        }

    green_pct = round((green_mask > 0).sum() / plant_px * 100, 1)
    stressed_pct = round((stressed_mask > 0).sum() / plant_px * 100, 1)
    health_score = round(green_pct, 1)

    if health_score >= 70:
        condition = "healthy"
    elif health_score >= 40:
        condition = "moderate_stress"
    else:
        condition = "severe_stress"

    return {
        "health_score": health_score,
        "condition": condition,
        "green_pct": green_pct,
        "stressed_pct": stressed_pct,
        "recommendation": _recommend(condition),
    }


def _recommend(condition: str) -> str:
    base = {
        "healthy": "Plant appears healthy based on leaf colour. Continue routine monitoring.",
        "moderate_stress": "Some leaf discolouration detected. Monitor closely over the next few days.",
        "severe_stress": "Significant leaf discolouration detected.",
    }[condition]
    return (
        base + " This is an informational estimate only, not a diagnosis - consult a "
        "qualified agricultural professional before making any treatment decision, "
        "including pesticide or chemical use."
    )

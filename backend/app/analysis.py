"""
Plant health assessment combines two signals:
1. HSV colour-fraction analysis: what fraction of the leaf/plant area is
   healthy green vs. yellow/brown/black - still used for the green_pct/
   stressed_pct/health_score numbers shown on the dashboard.
2. A trained MobileNetV2 classifier (healthy/moderate_stress/severe_stress),
   fine-tuned on ~590 labeled tomato-leaf photos (PlantVillage), reaching
   96.6% held-out validation accuracy - it now decides the "condition"
   label instead of the health_score threshold rule below
   (`classify_condition()`, kept as the fallback rule it's based on and
   still directly tested), EXCEPT when green_pct >= 95 (see the guardrail
   comment in analyze_plant) - real-world/stock photos outside PlantVillage's
   domain (isolated leaf, plain background) can otherwise get misjudged as
   badly as calling a near-entirely-green photo "severe_stress". This does
   NOT diagnose a specific disease and must never be used to guide
   pesticide/chemical treatment decisions - see README "Limitations" (the
   model was trained on tomato leaves only).
"""
import os

import cv2
import numpy as np
import torch
from PIL import Image
from torchvision import transforms

GREEN_RANGE = ((30, 40, 40), (90, 255, 255))
YELLOW_BROWN_RANGE = ((10, 40, 30), (30, 255, 220))

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "ml_model", "agrivision_classifier.pt")
_MODEL_CLASSES = ["healthy", "moderate_stress", "severe_stress"]
_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

_model = torch.jit.load(_MODEL_PATH, map_location="cpu")
_model.eval()


def classify_condition(health_score: float) -> str:
    if health_score >= 70:
        return "healthy"
    if health_score >= 40:
        return "moderate_stress"
    return "severe_stress"


def _predict_condition(frame: np.ndarray) -> str:
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    tensor = _TRANSFORM(Image.fromarray(rgb)).unsqueeze(0)
    with torch.no_grad():
        probs = torch.softmax(_model(tensor), dim=1)[0]
    idx = int(torch.argmax(probs))
    return _MODEL_CLASSES[idx]


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

    # Guardrail: the model was trained only on PlantVillage's isolated, plain-background
    # tomato-leaf photos, and misjudges real-world/stock photos it wasn't trained on badly
    # enough to call a near-entirely-green leaf "severe_stress" (observed on live demo
    # images - see README "Limitations"). Severe stress necessarily reduces green
    # coverage in the model's own training data, so an extremely high green fraction
    # overriding the model here is a narrow, principled sanity bound, not a rejection of
    # the model - ambiguous/mid-range cases still go entirely to the trained model below.
    if green_pct >= 95:
        condition = "healthy"
    else:
        condition = _predict_condition(frame)

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

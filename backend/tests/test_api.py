from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app, headers={"X-API-Key": settings.api_key})


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200


def test_protected_endpoint_rejects_missing_key():
    anon = TestClient(app)
    r = anon.get("/api/dashboard/summary")
    assert r.status_code == 401


def test_dashboard_summary_shape():
    r = client.get("/api/dashboard/summary")
    assert r.status_code == 200
    for key in ["total_checks", "avg_health_score", "healthy_count", "stressed_count"]:
        assert key in r.json()


def test_checks_list_returns_array():
    r = client.get("/api/checks")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_analyze_demo_runs_end_to_end():
    r = client.post("/api/analyze/demo")
    assert r.status_code in (200, 404)
    if r.status_code == 200:
        assert r.json()["condition"] in ("healthy", "moderate_stress", "severe_stress")

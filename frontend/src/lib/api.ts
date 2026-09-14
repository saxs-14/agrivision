const API_BASE = "";

export interface PlantCheck {
  id: number;
  source_filename: string;
  farm_name: string | null;
  health_score: number;
  condition: string;
  green_pct: number;
  stressed_pct: number;
  recommendation: string;
  created_at: string;
}

export interface DashboardSummary {
  total_checks: number;
  avg_health_score: number;
  healthy_count: number;
  stressed_count: number;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export const api = {
  health: () => fetch(`${API_BASE}/api/health`).then((r) => json<{ status: string }>(r)),
  summary: () => fetch(`${API_BASE}/api/dashboard/summary`).then((r) => json<DashboardSummary>(r)),
  checks: () => fetch(`${API_BASE}/api/checks`).then((r) => json<PlantCheck[]>(r)),
  exportCsvUrl: () => `${API_BASE}/api/checks/export`,
  runDemo: () => fetch(`${API_BASE}/api/analyze/demo`, { method: "POST" }).then((r) => json<PlantCheck>(r)),
  analyzeImage: (file: File, farmName: string) => {
    const form = new FormData();
    form.set("file", file);
    if (farmName) form.set("farm_name", farmName);
    return fetch(`${API_BASE}/api/analyze`, { method: "POST", body: form }).then((r) => json<PlantCheck>(r));
  },
};

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "https://agrivision-607032555709.us-central1.run.app";
const API_KEY = (import.meta.env.VITE_API_KEY as string) || "8f82c77e976877597287fd5c8af666c12af0985fb43792d9";

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

function authHeaders(): HeadersInit {
  return { "X-API-Key": API_KEY };
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

async function downloadFile(url: string, filename: string) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export const api = {
  health: () => fetch(`${API_BASE}/api/health`).then((r) => json<{ status: string }>(r)),
  summary: () =>
    fetch(`${API_BASE}/api/dashboard/summary`, { headers: authHeaders() }).then((r) => json<DashboardSummary>(r)),
  checks: () => fetch(`${API_BASE}/api/checks`, { headers: authHeaders() }).then((r) => json<PlantCheck[]>(r)),
  exportEvents: () => downloadFile(`${API_BASE}/api/checks/export`, "agrivision_checks.csv"),
  runDemo: () =>
    fetch(`${API_BASE}/api/analyze/demo`, { method: "POST", headers: authHeaders() }).then((r) =>
      json<PlantCheck>(r)
    ),
  analyzeImage: (file: File, farmName: string) => {
    const form = new FormData();
    form.set("file", file);
    if (farmName) form.set("farm_name", farmName);
    return fetch(`${API_BASE}/api/analyze`, { method: "POST", headers: authHeaders(), body: form }).then((r) =>
      json<PlantCheck>(r)
    );
  },
};

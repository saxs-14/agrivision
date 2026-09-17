import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api, DashboardSummary, PlantCheck } from "../lib/api";
import KpiCard from "../components/KpiCard";

const CONDITION_COLOR: Record<string, string> = {
  healthy: "text-emerald-400",
  moderate_stress: "text-amber-400",
  severe_stress: "text-red-500",
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [checks, setChecks] = useState<PlantCheck[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [farmName, setFarmName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PlantCheck | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([api.summary(), api.checks()]);
      setSummary(s);
      setChecks(c);
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    api.health().then(() => setApiOnline(true)).catch(() => setApiOnline(false));
    refresh();
  }, [refresh]);

  const runDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      setLastResult(await api.runDemo());
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const runUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      setLastResult(await api.analyzeImage(file, farmName));
      setFile(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Helmet>
        <title>Dashboard — AgriVision</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
          AgriVision
        </Link>
        <span className="flex items-center gap-2 text-xs">
          <span className={`inline-block h-2 w-2 rounded-full ${apiOnline ? "bg-emerald-500" : "bg-red-500"}`} />
          {apiOnline === null ? "Checking..." : apiOnline ? "Backend online" : "Backend offline"}
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <h1 className="sr-only">AgriVision crop health dashboard</h1>
        {!apiOnline && apiOnline !== null && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm">
            Can't reach the backend at <code>/api</code>. Start it with <code>uvicorn app.main:app --reload</code>.
          </div>
        )}

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="font-semibold mb-4">Check a plant</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-200"
            />
            <input
              placeholder="Farm name (optional)"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm flex-1 min-w-[160px]"
            />
            <button
              disabled={!file || loading}
              onClick={runUpload}
              className="rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40 transition px-4 py-2 text-sm font-medium"
            >
              {loading ? "Analyzing..." : "Analyze photo"}
            </button>
            <span className="text-slate-500 text-sm">or</span>
            <button
              disabled={loading}
              onClick={runDemo}
              className="rounded-lg border border-slate-700 hover:border-slate-500 disabled:opacity-40 transition px-4 py-2 text-sm font-medium"
            >
              {loading ? "Running..." : "Run demo sample"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          {lastResult && (
            <p className="mt-4 text-sm">
              <strong className={CONDITION_COLOR[lastResult.condition]}>
                {lastResult.condition.replace("_", " ")}
              </strong>{" "}
              (health score {lastResult.health_score}) — {lastResult.recommendation}
            </p>
          )}
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total checks" value={summary?.total_checks ?? "-"} />
          <KpiCard label="Avg. health score" value={summary?.avg_health_score ?? "-"} />
          <KpiCard label="Healthy" value={summary?.healthy_count ?? "-"} />
          <KpiCard label="Stressed" value={summary?.stressed_count ?? "-"} accent="alert" />
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Check history</h2>
            <button onClick={() => api.exportEvents()} className="text-sm rounded-lg border border-slate-700 hover:border-slate-500 transition px-3 py-1.5">
              Export CSV
            </button>
          </div>
          {checks.length === 0 ? (
            <p className="text-sm text-slate-500">No checks yet — run the demo or upload a photo above.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-800">
                  <th className="py-2 pr-4">File</th>
                  <th className="py-2 pr-4">Farm</th>
                  <th className="py-2 pr-4">Condition</th>
                  <th className="py-2 pr-4">Health score</th>
                  <th className="py-2 pr-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((c) => (
                  <tr key={c.id} className="border-b border-slate-800/60">
                    <td className="py-2 pr-4">{c.source_filename}</td>
                    <td className="py-2 pr-4">{c.farm_name ?? "—"}</td>
                    <td className={`py-2 pr-4 ${CONDITION_COLOR[c.condition]}`}>{c.condition.replace("_", " ")}</td>
                    <td className="py-2 pr-4">{c.health_score}</td>
                    <td className="py-2 pr-4 text-slate-500">{new Date(c.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

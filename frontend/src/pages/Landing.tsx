import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://agrivision-saxs-14s-projects.vercel.app";
const TITLE = "AgriVision — AI Crop Health Monitoring";
const DESCRIPTION =
  "Upload a leaf or plant photo and get an instant health estimate, tracked across your farm so you can catch problems early.";

const JSON_LD = {"@context": "https://schema.org", "@type": "SoftwareApplication", "name": "AgriVision", "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "description": "Upload a leaf or plant photo and get an instant health estimate, tracked across your farm so you can catch problems early.", "url": "https://agrivision-saxs-14s-projects.vercel.app", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}};

const FEATURES = [
  { title: "Leaf health estimate", desc: "Colour-based green vs. stressed leaf-area analysis." },
  { title: "Condition classification", desc: "Healthy, moderate stress, or severe stress." },
  { title: "Farm dashboard", desc: "Track checks across your whole farm over time." },
  { title: "Informational guidance", desc: "Always points to a qualified professional for treatment decisions." },
  { title: "CSV export", desc: "Export check history for record-keeping." },
  { title: "Demo mode", desc: "Run on bundled sample leaf photos." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={SITE_URL + "/"} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={SITE_URL + "/"} />
        <meta property="og:image" content={SITE_URL + "/og-image.png"} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={SITE_URL + "/og-image.png"} />

        <script type="application/ld+json">{JSON.stringify(JSON_LD)}</script>
      </Helmet>

      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
          AgriVision
        </div>
        <Link to="/app" className="rounded-lg bg-green-600 hover:bg-green-500 transition px-4 py-2 text-sm font-medium">
          Open dashboard
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <section className="py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Spot crop stress <span className="text-green-400">before it spreads</span>
          </h1>
          <p className="mt-5 text-slate-400 max-w-2xl mx-auto text-lg">
            Upload a leaf or plant photo and get an instant health estimate, tracked
            across your farm so you can catch problems early.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/app" className="rounded-lg bg-green-600 hover:bg-green-500 transition px-5 py-3 font-medium">
              Try the live demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            This is a colour-based estimate, not a diagnosis. Always consult a qualified
            agricultural professional before any treatment decision.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
          <h2 className="sr-only">Features</h2>
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="py-16 grid sm:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-3">Who it's for</h2>
            <ul className="text-slate-400 space-y-1.5 text-sm">
              <li>Small farmers</li>
              <li>Commercial farms</li>
              <li>Agricultural cooperatives</li>
              <li>Agricultural consultants</li>
              <li>Nurseries</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Pricing model</h2>
            <ul className="text-slate-400 space-y-1.5 text-sm">
              <li>Farmer subscription</li>
              <li>Farm-wide subscription</li>
              <li>Agricultural analytics package</li>
              <li>B2B licensing for cooperatives</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        AgriVision — crop monitoring MVP. Informational only, not agronomic advice.
      </footer>
    </div>
  );
}

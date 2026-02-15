'use client';

import { useEffect, useState } from "react";

type ResearchJobSummary = {
  job_id: string;
  title: string;
  status: string;
  prompt_snippet: string;
  created_at: string;
  updated_at: string;
  version: number;
};

type InfographicBlock = {
  id: string;
  block_type: string;
  headline: string;
  description: string;
  citation_ids: string[];
  metric?: string | null;
};

type InfographicSpec = {
  title: string;
  layout: string;
  generated_at: string;
  visual_focus: string;
  callouts: string[];
  citation_markers: string[];
  blocks: InfographicBlock[];
};

type ResearchSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  snippet: string;
  reliability_score: number;
  accessed_at: string;
};

type ResearchArticle = {
  title: string;
  overview: string;
  key_points: string[];
  confidence: string;
  limitations: string;
  sections: { heading: string; body: string; citations: string[] }[];
};

type ResearchJob = {
  job_id: string;
  prompt: string;
  summary: string;
  status: string;
  version: number;
  infographic_spec: InfographicSpec;
  article: ResearchArticle;
  sources: ResearchSource[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function HomePage() {
  const [prompt, setPrompt] = useState("The future of sustainable AI adoption");
  const [job, setJob] = useState<ResearchJob | null>(null);
  const [summaries, setSummaries] = useState<ResearchJobSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/research-summary`)
      .then((res) => res.json())
      .then((summary) => console.info("Summary", summary))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/research-jobs`)
      .then((res) => res.json())
      .then((data) => setSummaries(data))
      .catch((err) => console.error(err));
  }, [job]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/research-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, settings: { audience: "Analysts" } }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to generate research job");
      }
      const data = await response.json();
      setJob(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function renderInfographic(spec: InfographicSpec) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="text-xs uppercase tracking-wide text-slate-400">Infographic · {spec.layout}</div>
        <h2 className="text-2xl font-bold text-white">{spec.visual_focus}</h2>
        <p className="text-sm text-slate-400">{spec.title}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {spec.blocks.map((block) => (
            <div key={block.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-xs uppercase text-slate-500">{block.block_type}</p>
              <p className="text-sm font-semibold">{block.headline}</p>
              <p className="text-xs text-slate-400">{block.description}</p>
              {block.metric && <p className="text-sm font-bold text-emerald-400">{block.metric}</p>}
              <p className="text-xs text-slate-500">Citations: {block.citation_ids.join(" ")}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {spec.callouts.map((callout, index) => (
            <div key={`callout-${index}`} className="text-xs text-slate-300 italic">
              {callout}
            </div>
          ))}
        </div>
        <div className="text-xs text-slate-500">Markers: {spec.citation_markers.join(" ")}</div>
        <div className="text-xs text-slate-500">Rendered at {new Date(spec.generated_at).toLocaleString()}</div>
      </div>
    );
  }

  const historyContent = summaries.length ? (
    summaries.map((item) => (
      <div key={item.job_id} className="p-4 bg-slate-900 border border-slate-800 rounded">
        <p className="text-xs text-slate-500 uppercase tracking-wide">{item.status}</p>
        <p className="font-semibold">{item.title}</p>
        <p className="text-xs text-slate-400">{item.prompt_snippet}</p>
        <p className="text-xs text-slate-500">Updated {new Date(item.updated_at).toLocaleString()}</p>
      </div>
    ))
  ) : (
    <p className="text-sm text-slate-500">No history yet. Generate a research job to populate this space.</p>
  );

  if (!job) {
    return (
      <main className="min-h-screen px-4 py-12 md:px-16">
        <section className="mx-auto max-w-4xl space-y-10 text-white">
          <div className="text-center space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Research Infographic Studio</p>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
              AI-generated infographics built on trusted sources
            </h1>
            <p className="text-lg text-slate-300">
              Sign in with Google, submit your research prompt, and receive an infographic, article, and citation pack
              ready for export.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-6">
            <div>
              <p className="text-xs uppercase text-slate-400">New research</p>
              <h2 className="text-2xl font-semibold">Prompt editor</h2>
            </div>
            <textarea
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white"
              rows={5}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-2xl bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:bg-blue-700"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "Generating…" : "Generate infographic"}
              </button>
              <button className="rounded-2xl border border-white/30 px-5 py-2 text-xs uppercase tracking-wide text-white/70">
                Settings
              </button>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Research history</h3>
              <p className="text-xs text-slate-400">{summaries.length} past jobs</p>
            </div>
            <div className="mt-4 space-y-3">{historyContent}</div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 md:px-16">
      <section className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Infographic ready</p>
            <h1 className="text-3xl font-bold text-white md:text-5xl">{job.article.title}</h1>
            <p className="text-sm text-slate-500">Confidence: {job.article.confidence}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
              Export PNG
            </button>
            <button className="rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80">
              Export article
            </button>
          </div>
        </header>
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            {renderInfographic(job.infographic_spec)}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Article overview</h2>
              <p className="text-sm text-slate-200">{job.article.overview}</p>
              <div className="grid gap-3">
                {job.article.key_points.map((point) => (
                  <div key={point} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                    {point}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-wide text-slate-500">Limitations</p>
                <p>{job.article.limitations}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Article sections</h2>
              <div className="space-y-3">
                {job.article.sections.map((section) => (
                  <div key={section.heading} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{section.heading}</p>
                    <p className="text-sm text-slate-200">{section.body}</p>
                    <p className="text-xs text-slate-500">Citations: {section.citations.join(" ")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
              <h3 className="text-xs uppercase tracking-[0.4em] text-slate-400">Sources</h3>
              <div className="space-y-3">
                {job.sources.map((source) => (
                  <div key={source.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-sm font-semibold text-white">{source.title}</p>
                    <p className="text-xs text-slate-500">{source.publisher}</p>
                    <p className="text-xs text-slate-400">{source.snippet}</p>
                    <a
                      href={source.url}
                      className="text-xs text-indigo-300"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit source
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <p>Job progress</p>
                <p className="text-emerald-300">Complete</p>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: "92%" }} />
              </div>
              <button className="text-xs text-slate-200 underline">View detailed progress</button>
            </div>
          </aside>
        </div>
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">History</h3>
            <p className="text-xs text-slate-400">{summaries.length} past jobs</p>
          </div>
          <div className="mt-4 grid gap-3">{historyContent}</div>
        </section>
      </section>
    </main>
  );
}

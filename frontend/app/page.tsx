<<<<<<< HEAD
'use client';

import { useEffect, useState } from "react";

import { TrustPanel, TrustMetadata } from "./components/trust-panel";

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
  citation_index: number;
};

type ArticleHighlight = {
  text: string;
  citations: number[];
};

type ResearchArticle = {
  title: string;
  overview: string;
  key_points: ArticleHighlight[];
  confidence: string;
  confidence_note: string;
  limitations: string;
  detailed_explanation: string;
  implications: ArticleHighlight[];
  sections: { heading: string; body: string; citations: number[] }[];
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
  trust: TrustMetadata;
};

type ProductFeature = {
  name: string;
  description: string;
  tags: string[];
};

type SuccessMetric = {
  name: string;
  target: string;
  current_estimate: string;
};

type UserJourney = {
  title: string;
  description: string;
  steps: string[];
};

type ArchitectureComponent = {
  name: string;
  description: string;
};

type ProductInfo = {
  name: string;
  tagline: string;
  summary: string;
  vision: string;
  goals: string[];
  features: ProductFeature[];
  success_metrics: SuccessMetric[];
  user_journeys: UserJourney[];
  system_architecture: ArchitectureComponent[];
  last_updated: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function HomePage() {
  const [prompt, setPrompt] = useState("The future of sustainable AI adoption");
const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [job, setJob] = useState<ResearchJob | null>(null);
  const [summaries, setSummaries] = useState<ResearchJobSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPackage, setDownloadingPackage] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/research-summary`)
      .then((res) => res.json())
      .then((summary) => console.info("Summary", summary))
      .catch((err) => console.error(err));

    fetch(`${API_URL}/product-info`)
      .then((res) => res.json())
      .then((info) => setProductInfo(info))
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

  async function handleDownloadPackage() {
    if (!job) {
      return;
    }
    setDownloadingPackage(true);
    setDownloadError(null);
    try {
      const response = await fetch(`${API_URL}/research-jobs/${job.job_id}/package`);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to download shareable package");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `research-${job.job_id}-package.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError((err as Error).message);
    } finally {
      setDownloadingPackage(false);
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
            {productInfo && (
              <div className="mt-4 space-y-3 rounded-2xl border border-white/20 bg-slate-950/50 p-4 text-left text-sm text-slate-200">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{productInfo.tagline}</p>
                <p className="text-sm text-slate-300">{productInfo.summary}</p>
                <p className="text-xs text-slate-400">Vision: {productInfo.vision}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {productInfo.goals.map((goal) => (
                    <div key={goal} className="rounded-xl bg-slate-900/70 p-2 text-xs text-slate-200">
                      {goal}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            {productInfo && (
              <div className="mt-6 space-y-3 rounded-2xl border border-dashed border-white/20 bg-slate-950/60 p-4 text-sm text-slate-200">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">System architecture</p>
                <div className="space-y-2">
                  {productInfo.system_architecture.map((component) => (
                    <div key={component.name} className="space-y-1">
                      <p className="text-xs font-semibold text-white">{component.name}</p>
                      <p className="text-xs text-slate-400">{component.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    );
  }

  const sortedSources = [...job.sources].sort((a, b) => a.citation_index - b.citation_index);

  const renderCitations = (citations: number[]) => {
    if (!citations.length) {
      return null;
    }
    return citations.map((citation, index) => (
      <a
        key={`${citation}-${index}`}
        href={`#source-${citation}`}
        className="text-xs text-indigo-300 underline"
      >
        [{citation}]
      </a>
    ));
  };

  const detailedSection = job.article.sections.find((section) => section.heading === "Detailed explanation");

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
            <button
              className="rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-400 disabled:bg-emerald-700"
              onClick={handleDownloadPackage}
              disabled={downloadingPackage}
            >
              {downloadingPackage ? "Preparing package…" : "Download shareable package"}
            </button>
          </div>
          {downloadError && <p className="text-xs text-red-400">{downloadError}</p>}
        </header>
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            {renderInfographic(job.infographic_spec)}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Article overview</h2>
              <p className="text-sm text-slate-200">{job.article.overview}</p>
              <div className="grid gap-3">
                {job.article.key_points.map((point, index) => (
                  <div
                    key={`${point.text}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200"
                  >
                    <p>{point.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {renderCitations(point.citations)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-wide text-slate-500">Limitations</p>
                <p>{job.article.limitations}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
              <h2 className="text-lg font-semibold">Implications / applications</h2>
              <div className="grid gap-3">
                {job.article.implications.map((implication, index) => (
                  <div key={`${implication.text}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200">
                    <p>{implication.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {renderCitations(implication.citations)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-2">
              <h2 className="text-lg font-semibold">Confidence / uncertainty notes</h2>
              <p className="text-sm text-slate-200">{job.article.confidence_note}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Detailed explanation</h2>
              <p className="text-sm text-slate-200">{job.article.detailed_explanation}</p>
              {detailedSection && detailedSection.citations.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-indigo-300">
                  {renderCitations(detailedSection.citations)}
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Structured narrative</h2>
              <div className="space-y-3">
                {job.article.sections.map((section) => (
                  <div key={section.heading} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{section.heading}</p>
                    <p className="text-sm text-slate-200">{section.body}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-indigo-300">
                      {renderCitations(section.citations)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
              <h3 className="text-xs uppercase tracking-[0.4em] text-slate-400">Sources</h3>
              <div className="space-y-3">
                {sortedSources.map((source) => (
                  <div
                    key={source.id}
                    id={`source-${source.citation_index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-3"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">[{source.citation_index}] {source.publisher}</p>
                    <p className="text-sm font-semibold text-white">{source.title}</p>
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
=======
const heroBenefits = [
  'Instant AI-generated infographics, articles, and citations',
  'Traceable sources with clickable metadata',
  'History with exports for PNG, Markdown, PDF, and CSV',
]

export const dynamic = 'force-dynamic'

const getBackendHealth = async () => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/health`
  try {
    const response = await fetch(apiUrl, { cache: 'no-store' })
    if (!response.ok) {
      return { status: 'unhealthy', detail: `HTTP ${response.status}` }
    }

    const data = await response.json()
    return { status: data.get('status') || data.status || 'ok', detail: 'Backend reachable' }
  } catch (error) {
    return { status: 'unreachable', detail: 'Could not reach backend' }
  }
}

export default async function Home() {
  const backendHealth = await getBackendHealth()

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-4 py-12 text-white">
      <section className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Research Infographic Studio</p>
        <h1 className="text-4xl font-semibold text-white md:text-5xl">
          Ask a research question, get a cited infographic + article instantly.
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-indigo-100">
          Launch a research prompt, let the AI gather sources, draft an explanatory article, and produce a shareable infographic complete with citations and confidence notes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/40">
            Sign in with Google
          </button>
          <button className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white">
            Explore Research Gallery
          </button>
        </div>
        <div className="grid gap-6 text-left md:grid-cols-3">
          {heroBenefits.map((benefit) => (
            <article key={benefit} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Benefit</p>
              <p className="mt-2 text-base">{benefit}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Workflow</p>
        <h2 className="text-2xl font-semibold">From prompt to shareable research story</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: 'Prompt', detail: 'Voice or write your research question with optional guidance.' },
            { title: 'Sources', detail: 'AI searches credible sites, curates citations, and notes confidence.' },
            { title: 'Infographic & Article', detail: 'Maps insights to visual layout and narrative sections with citations.' },
          ].map((step) => (
            <article key={step.title} className="rounded-xl bg-[#10182f] p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">{step.title}</p>
              <p className="mt-2 text-lg font-semibold">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Research results</p>
        <h2 className="text-2xl font-semibold">Stay organized, revisit insights, and export with confidence</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {[
            { title: 'History', detail: 'Searchable timeline of prompts, versions, and exports.' },
            { title: 'Exports', detail: 'PNG, PDF, Markdown, CSV, and JSON sharing-ready bundles.' },
            { title: 'Trust', detail: 'Inline citations with source metadata and uncertainty notes.' },
          ].map((gridItem) => (
            <article key={gridItem.title} className="rounded-lg bg-gradient-to-b from-[#212945] to-[#151a2c] p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">{gridItem.title}</p>
              <p className="mt-2 text-base text-indigo-100">{gridItem.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Getting started</p>
        <h2 className="text-2xl font-semibold">Connect your Google account & start researching</h2>
        <p className="text-base text-indigo-100">
          Complete the OAuth flow to save results, fine-tune prompts, and export curated knowledge. Your data is private by default.
        </p>
        <div className="grid gap-4 text-sm text-indigo-200 md:grid-cols-3">
          {[
            'Sign in with Google',
            'Enter research prompt + settings',
            'Review infographic, article, and sources',
          ].map((todo) => (
            <p key={todo} className="rounded-lg border border-white/10 bg-[#080c1c] p-4">{todo}</p>
          ))}
        </div>
      </section>
    </main>
  )
>>>>>>> dev#feature#research-infographic-studio
}

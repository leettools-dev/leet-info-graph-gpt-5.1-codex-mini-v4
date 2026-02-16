'use client';

import { useEffect, useMemo, useState } from "react";
import { TrustPanel, type TrustMetadata } from "./components/trust-panel";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ResearchJobSummary = {
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
  publish_date?: string | null;
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
  progress: { name: string; completed: boolean; timestamp: string }[];
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

type ExportAsset = "infographic" | "article";

const EXPORT_CONFIG: Record<ExportAsset, { label: string; busyLabel: string; endpoint: string; filenameSuffix: string }> = {
  infographic: {
    label: "Export PNG",
    busyLabel: "Exporting PNG…",
    endpoint: "infographic",
    filenameSuffix: "-infographic.png",
  },
  article: {
    label: "Export article",
    busyLabel: "Exporting article…",
    endpoint: "article",
    filenameSuffix: "-article.md",
  },
};

const formatDate = (iso: string) => new Date(iso).toLocaleString();
const formatOptionalDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : "Unknown");
const formatReliability = (score: number) => `${Math.round(score * 100)}% reliability`;

const initialPrompt = "The future of sustainable AI adoption";
export const dynamic = "force-dynamic";

export default function HomePage() {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [job, setJob] = useState<ResearchJob | null>(null);
  const [summaries, setSummaries] = useState<ResearchJobSummary[]>([]);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPackage, setDownloadingPackage] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [exportingAsset, setExportingAsset] = useState<ExportAsset | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
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

  const historyContent = useMemo(() => {
    if (!summaries.length) {
      return (
        <p className="text-sm text-slate-500">Generate a research job to populate your history.</p>
      );
    }

    return summaries.map((item) => (
      <div key={item.job_id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
        <p className="text-xs text-slate-400 uppercase tracking-[0.3em]">{item.status}</p>
        <p className="font-semibold text-white">{item.title}</p>
        <p className="text-xs text-slate-500">{item.prompt_snippet}</p>
        <p className="text-xs text-slate-500">Updated {formatDate(item.updated_at)}</p>
      </div>
    ));
  }, [summaries]);

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

  async function handleExportAsset(asset: ExportAsset) {
    if (!job) {
      return;
    }
    setExportingAsset(asset);
    setExportError(null);
    try {
      const response = await fetch(`${API_URL}/research-jobs/${job.job_id}/${EXPORT_CONFIG[asset].endpoint}`);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Failed to export ${asset}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `research-${job.job_id}${EXPORT_CONFIG[asset].filenameSuffix}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError((err as Error).message);
    } finally {
      setExportingAsset((current) => (current === asset ? null : current));
    }
  }

  const renderCitations = (citations: number[]) =>
    citations.map((citation) => (
      <a
        key={citation}
        href={`#source-${citation}`}
        className="text-xs text-indigo-300 underline"
      >
        [{citation}]
      </a>
    ));

  const renderInfographic = (spec: InfographicSpec) => (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
      <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Infographic · {spec.layout}</div>
      <h2 className="text-3xl font-bold text-white">{spec.visual_focus}</h2>
      <p className="text-sm text-slate-400">{spec.title}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {spec.blocks.map((block) => (
          <div
            key={block.id}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2"
          >
            <p className="text-xs uppercase text-slate-500">{block.block_type}</p>
            <p className="text-sm font-semibold text-white">{block.headline}</p>
            <p className="text-xs text-slate-400">{block.description}</p>
            {block.metric && <p className="text-sm font-bold text-emerald-400">{block.metric}</p>}
            <p className="text-xs text-slate-500">Citations: {block.citation_ids.join(" ")}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-300">
        {spec.callouts.map((callout, idx) => (
          <p key={`callout-${idx}`} className="italic">
            {callout}
          </p>
        ))}
      </div>
      <div className="text-xs text-slate-500">Markers: {spec.citation_markers.join(" ")}</div>
      <div className="text-xs text-slate-500">Rendered at {formatDate(spec.generated_at)}</div>
    </div>
  );

  const renderProgress = (progress: ResearchJob["progress"]) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500">Job progress</p>
        <p className="text-xs text-emerald-300">Complete</p>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: "92%" }} />
      </div>
      <div className="grid gap-2 text-xs text-slate-400">
        {progress.map((step) => (
          <p key={step.name} className="flex items-center justify-between">
            <span>{step.name}</span>
            <span>{new Date(step.timestamp).toLocaleTimeString()}</span>
          </p>
        ))}
      </div>
    </div>
  );

  if (!job) {
    return (
      <main className="min-h-screen px-4 py-12 md:px-16 text-white">
        <section className="mx-auto max-w-5xl space-y-10">
          <div className="space-y-4 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Research Infographic Studio</p>
            <h1 className="text-4xl font-bold text-white md:text-6xl">
              AI-generated infographics built on trusted sources
            </h1>
            <p className="text-lg text-slate-300">
              Sign in with Google, submit your research prompt, and receive an infographic, article, and citation pack ready for export.
            </p>
            {productInfo && (
              <div className="rounded-3xl border border-white/20 bg-slate-950/60 p-6 space-y-3 text-left text-sm">
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
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Research history</h3>
              <p className="text-xs text-slate-400">{summaries.length} past jobs</p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">{historyContent}</div>
            {productInfo && (
              <div className="rounded-2xl border border-dashed border-white/20 bg-slate-950/60 p-4 text-sm">
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
  const detailedSection = job.article.sections.find((section) => section.heading === "Detailed explanation");

  return (
    <main className="min-h-screen px-4 py-12 md:px-16 text-white">
      <section className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Infographic ready</p>
            <h1 className="text-3xl font-bold text-white md:text-5xl">{job.article.title}</h1>
            <p className="text-sm text-slate-500">Confidence: {job.article.confidence}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {(['infographic', 'article'] as ExportAsset[]).map((asset) => (
              <button
                key={asset}
                className="rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition disabled:border-white/30 disabled:text-white/50"
                onClick={() => handleExportAsset(asset)}
                disabled={exportingAsset !== null}
              >
                {exportingAsset === asset ? EXPORT_CONFIG[asset].busyLabel : EXPORT_CONFIG[asset].label}
              </button>
            ))}
            <button
              className="rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-400 disabled:bg-emerald-700"
              onClick={handleDownloadPackage}
              disabled={downloadingPackage}
            >
              {downloadingPackage ? "Preparing package…" : "Download shareable package"}
            </button>
          </div>
          {downloadError && <p className="text-xs text-red-400">{downloadError}</p>}
          {exportError && <p className="text-xs text-red-400">{exportError}</p>}
        </header>
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            {renderInfographic(job.infographic_spec)}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Article overview</h2>
                <p className="text-sm text-slate-200">{job.article.overview}</p>
              </div>
              <div className="grid gap-3">
                {job.article.key_points.map((point, index) => (
                  <div
                    key={`${point.text}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200 space-y-2"
                  >
                    <p>{point.text}</p>
                    <div className="flex flex-wrap gap-2">{renderCitations(point.citations)}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500">Limitations</p>
                <p>{job.article.limitations}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Implications / applications</h2>
              <div className="grid gap-3">
                {job.article.implications.map((implication, index) => (
                  <div
                    key={`${implication.text}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200 space-y-2"
                  >
                    <p>{implication.text}</p>
                    <div className="flex flex-wrap gap-2">{renderCitations(implication.citations)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
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
                  <div key={section.heading} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
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
            <TrustPanel trust={job.trust} />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
              {renderProgress(job.progress)}
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
              <h3 className="text-xs uppercase tracking-[0.4em] text-slate-400">Sources</h3>
              <div className="space-y-3">
                {sortedSources.map((source) => (
                  <div
                    key={source.id}
                    id={`source-${source.citation_index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-1"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">[{source.citation_index}] {source.publisher}</p>
                    <p className="text-sm font-semibold text-white">{source.title}</p>
                    <p className="text-[0.7rem] text-slate-500">
                      Published {formatOptionalDate(source.publish_date)} · Accessed {formatDate(source.accessed_at)} · {formatReliability(source.reliability_score)}
                    </p>
                    <p className="text-xs text-slate-400 italic">{source.snippet}</p>
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
          </aside>
        </div>
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
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

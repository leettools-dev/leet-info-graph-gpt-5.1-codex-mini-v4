export type ProvenanceRecord = {
  id: string;
  phase: string;
  summary: string;
  detail?: string | null;
  source_ids: string[];
  timestamp: string;
};

export type TrustMetadata = {
  confidence_level: string;
  confidence_note: string;
  reliability_summary: string;
  average_reliability_score: number;
  last_verified_at: string;
  provenance: ProvenanceRecord[];
};

type TrustPanelProps = {
  trust: TrustMetadata;
};

export function TrustPanel({ trust }: TrustPanelProps) {
  const averageReliabilityPercent = Math.round(trust.average_reliability_score * 100);
  const lastVerified = new Date(trust.last_verified_at).toLocaleString();

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Trust & provenance</p>
          <h3 className="text-lg font-semibold text-white">{trust.confidence_level}</h3>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>Average reliability {averageReliabilityPercent}%</p>
          <p>Verified {lastVerified}</p>
        </div>
      </div>
      <p className="text-sm text-slate-200">{trust.reliability_summary}</p>
      <p className="text-sm text-slate-300">{trust.confidence_note}</p>
      <div className="space-y-3">
        {trust.provenance.map((record) => (
          <article key={record.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-400">{record.phase}</p>
              <p className="text-[0.65rem] text-slate-500">{new Date(record.timestamp).toLocaleString()}</p>
            </div>
            <p className="text-sm text-slate-100">{record.summary}</p>
            {record.detail && <p className="text-xs text-slate-500">Detail: {record.detail}</p>}
            <p className="text-xs text-slate-500">Sources: {record.source_ids.join(", ")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

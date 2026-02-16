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
}

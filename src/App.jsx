import PolyEdgeScanner from './PolyEdgeScanner.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-night text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-night/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400/70 via-indigo-500/70 to-fuchsia-500/70 shadow-glass"></div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">PolyEdge</p>
              <p className="text-xl font-semibold text-white">Scanner</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="pulse-dot flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300 shadow-glass">
              <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              Live
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1 md:flex">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              AI Oracle Dual-Stack
            </div>
          </div>
        </div>
      </header>
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-indigo-950/80 via-night to-emerald-950/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-5 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              Real-time Polymarket Intel
            </div>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">PolyEdge Scanner</h1>
            <p className="text-lg text-slate-300">Zero-login execution surface. Flip Simulation off to stream live Gamma markets, score edges, tap the AI oracle, and copy intent in one tap.</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-glass ring-1 ring-white/15 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">Login with X to Continue</button>
              <div className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">No auth required — dashboard auto-loads</div>
            </div>
          </div>
          <div className="glass gradient-border relative w-full max-w-lg overflow-hidden rounded-3xl p-[1px]">
            <div className="glass relative h-full rounded-3xl p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-indigo-500/10 to-fuchsia-500/10" />
              <div className="relative space-y-4 text-sm text-slate-200">
                <p className="text-lg font-semibold text-white">Immediate Edge Dashboard</p>
                <p className="text-slate-300">Live Gamma feed, 60s auto-refresh, deterministic scoring, AI oracle (Claude + Gemini), and instant @bankrbot copy intent.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Live Feed</p>
                    <p className="text-xl font-semibold text-white">Gamma /api/gamma</p>
                  </div>
                  <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Oracle</p>
                    <p className="text-xl font-semibold text-white">Claude + Gemini</p>
                  </div>
                  <div className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200">Copy Intent</p>
                    <p className="text-xl font-semibold text-white">@bankrbot DM</p>
                  </div>
                  <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Mode</p>
                    <p className="text-xl font-semibold text-white">Live / Simulation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PolyEdgeScanner />
    </div>
  )
}

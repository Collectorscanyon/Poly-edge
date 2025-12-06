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
      <PolyEdgeScanner />
    </div>
  )
}

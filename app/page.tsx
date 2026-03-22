import SubmitForm from '@/components/SubmitForm'
import Feed from '@/components/Feed'

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <aside className="w-2/5 shrink-0 h-screen overflow-y-auto feed-scroll
                        border-r border-zinc-800/70 bg-zinc-950
                        flex flex-col px-8 py-10 gap-8
                        animate-panel-in">

        {/* Brand */}
        <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-between mb-3">

            {/* Logo + title — hover group */}
            <div className="group/brand flex items-center gap-2.5 cursor-default select-none">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center
                              group-hover/brand:scale-110 group-hover/brand:rotate-12
                              group-hover/brand:shadow-lg group-hover/brand:shadow-white/20
                              transition-all duration-300 ease-out">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white
                             group-hover/brand:text-zinc-200 transition-colors duration-200">
                Build Log
              </h1>
            </div>

            {/* Live badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400
                            bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1
                            hover:bg-emerald-500/20 hover:scale-105 hover:border-emerald-500/40
                            transition-all duration-200 cursor-default select-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              live
            </div>
          </div>

          <p className="text-zinc-400 text-[13px] leading-relaxed">
            Every great product started as a small ship.<br />
            <span className="text-zinc-600">Drop yours. Someone's waiting to see it.</span>
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent
                        animate-fade-up" style={{ animationDelay: '120ms' }} />

        {/* Form */}
        <div className="flex-1 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <SubmitForm />
        </div>

        {/* Footer */}
        <p className="text-[11px] text-zinc-800 text-center hover:text-zinc-600
                      transition-colors duration-300 cursor-default select-none
                      animate-fade-up" style={{ animationDelay: '220ms' }}>
          Every post is public · No accounts needed
        </p>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className="flex-1 h-screen overflow-y-auto feed-scroll bg-zinc-950 px-8 py-10">
        <Feed />
      </main>

    </div>
  )
}

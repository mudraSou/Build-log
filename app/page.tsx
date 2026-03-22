import SubmitForm from '@/components/SubmitForm'
import Feed from '@/components/Feed'

export default function Home() {
  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Build Log
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            live
          </div>
        </div>
        <p className="text-zinc-500 text-sm">What did you ship today? Show the cohort.</p>
      </div>

      <SubmitForm />

      <div className="mt-10">
        <Feed />
      </div>
    </main>
  )
}

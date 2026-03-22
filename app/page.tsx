import SubmitForm from '@/components/SubmitForm'
import Feed from '@/components/Feed'

export default function Home() {
  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Build Log</h1>
        <p className="text-zinc-400 mt-1 text-sm">Ship it. Show it. See what everyone's building.</p>
      </div>

      <SubmitForm />

      <div className="mt-10">
        <Feed />
      </div>
    </main>
  )
}

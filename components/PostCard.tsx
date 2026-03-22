import { timeAgo } from '@/lib/time'
import type { Post } from '@/types'

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500',   'bg-pink-500', 'bg-cyan-500',    'bg-orange-500',
]

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url }
}

function isNew(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 5 * 60 * 1000
}

export default function PostCard({ post, animateIn = false }: { post: Post; animateIn?: boolean }) {
  const fullDate = new Date(post.created_at).toLocaleString()

  return (
    <div
      className={`group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-200 ${
        animateIn ? 'animate-fade-up' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full ${avatarColor(post.name)} flex items-center justify-center text-xs font-bold text-white shrink-0`}
          >
            {post.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white">{post.name}</span>
            {isNew(post.created_at) && (
              <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full leading-none">
                NEW
              </span>
            )}
          </div>
        </div>
        <span
          className="text-xs text-zinc-500 shrink-0 mt-0.5 cursor-default"
          title={fullDate}
        >
          {timeAgo(post.created_at)}
        </span>
      </div>

      <p className="text-sm text-zinc-300 leading-relaxed">{post.description}</p>

      {post.link && (
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 rounded-md px-2.5 py-1.5 transition-all"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          {getDomain(post.link)}
        </a>
      )}
    </div>
  )
}

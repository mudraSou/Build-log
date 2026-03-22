import { timeAgo } from '@/lib/time'
import type { Post } from '@/types'

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300 shrink-0">
            {post.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-sm text-white">{post.name}</span>
        </div>
        <span className="text-xs text-zinc-500 shrink-0 mt-1">{timeAgo(post.created_at)}</span>
      </div>

      <p className="text-sm text-zinc-300 leading-relaxed mt-3">{post.description}</p>

      {post.link && (
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-md px-2.5 py-1.5 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          View project
        </a>
      )}
    </div>
  )
}

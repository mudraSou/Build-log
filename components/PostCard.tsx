'use client'

import { useState } from 'react'
import { timeAgo } from '@/lib/time'
import type { Post } from '@/types'

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500',  'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500',   'bg-pink-500',  'bg-cyan-500',    'bg-orange-500',
  'bg-indigo-500', 'bg-teal-500',  'bg-fuchsia-500', 'bg-lime-500',
]

function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url }
}

function isNew(d: string) {
  return Date.now() - new Date(d).getTime() < 5 * 60 * 1000
}

export default function PostCard({ post, animateIn = false }: { post: Post; animateIn?: boolean }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    if (!post.link) return
    navigator.clipboard.writeText(post.link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <article
      className={`
        group relative bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5
        hover:bg-zinc-900 hover:border-zinc-700 hover:-translate-y-1
        hover:shadow-xl hover:shadow-black/40
        transition-all duration-200 cursor-default
        ${animateIn ? 'animate-fade-up' : ''}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar with hover spin */}
          <div
            className={`
              w-9 h-9 rounded-xl ${avatarColor(post.name)}
              flex items-center justify-center text-[13px] font-bold text-white shrink-0
              group-hover:scale-110 group-hover:rotate-6
              transition-transform duration-200
            `}
          >
            {post.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white leading-none">{post.name}</span>
              {isNew(post.created_at) && (
                <span className="animate-bounce-in text-[9px] font-bold tracking-widest uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">
                  new
                </span>
              )}
            </div>
            <span
              className="text-[11px] text-zinc-600 mt-0.5 block cursor-default"
              title={new Date(post.created_at).toLocaleString()}
            >
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>

        {/* Copy link micro-action */}
        {post.link && (
          <button
            onClick={copyLink}
            title={copied ? 'Copied!' : 'Copy link'}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
          >
            {copied
              ? <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
            }
          </button>
        )}
      </div>

      {/* Title */}
      {post.title && (
        <h3 className="text-white font-semibold text-[15px] leading-snug mb-2">
          {post.title}
        </h3>
      )}

      {/* Description */}
      <p className="text-[13px] text-zinc-400 leading-relaxed">{post.description}</p>

      {/* Link */}
      {post.link && (
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1.5 mt-4 text-[12px] text-zinc-500
                     hover:text-white border border-zinc-800 hover:border-zinc-600
                     hover:bg-zinc-800/60 rounded-lg px-3 py-1.5 transition-all duration-150"
        >
          <svg
            className="h-3 w-3 transition-transform duration-150 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          {getDomain(post.link)}
        </a>
      )}
    </article>
  )
}

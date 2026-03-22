'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase, fetchPosts } from '@/lib/supabase'
import PostCard from '@/components/PostCard'
import type { Post } from '@/types'

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [pending, setPending] = useState<Post[]>([])
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPosts()
      .then((data) => setPosts(data))
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false))

    const channel = supabase
      .channel('posts-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          setPending((prev) => [payload.new as Post, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  function showPending() {
    setNewIds(new Set(pending.map((p) => p.id)))
    setPosts((prev) => [...pending, ...prev])
    setPending([])
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => setNewIds(new Set()), 3000)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-zinc-700" />
              <div className="h-3 bg-zinc-700 rounded w-28" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-zinc-800 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-zinc-500 text-sm">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); fetchPosts().then(setPosts).catch(() => setError('Failed to load posts.')).finally(() => setLoading(false)) }}
          className="mt-3 text-xs text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  if (posts.length === 0 && pending.length === 0) {
    return (
      <div className="text-center py-14">
        <div className="text-3xl mb-3">🚀</div>
        <p className="text-zinc-400 text-sm font-medium">Be the first to ship something.</p>
        <p className="text-zinc-600 text-xs mt-1">Your post will appear here.</p>
      </div>
    )
  }

  return (
    <div>
      <div ref={topRef} />

      {pending.length > 0 && (
        <button
          onClick={showPending}
          className="w-full mb-4 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/15 transition-colors animate-slide-down"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
          </svg>
          {pending.length} new ship{pending.length > 1 ? 's' : ''} — tap to show
        </button>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-zinc-500">
          {posts.length} ship{posts.length === 1 ? '' : 's'} so far
        </p>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} animateIn={newIds.has(post.id)} />
        ))}
      </div>
    </div>
  )
}

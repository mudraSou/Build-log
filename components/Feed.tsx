'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase, fetchPosts } from '@/lib/supabase'
import PostCard from '@/components/PostCard'
import type { Post } from '@/types'

function SkeletonCard() {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-zinc-800" />
        <div className="space-y-1.5">
          <div className="h-3 bg-zinc-800 rounded w-24" />
          <div className="h-2.5 bg-zinc-800/60 rounded w-16" />
        </div>
      </div>
      <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800/60 rounded w-full" />
        <div className="h-3 bg-zinc-800/60 rounded w-5/6" />
        <div className="h-3 bg-zinc-800/60 rounded w-2/3" />
      </div>
    </div>
  )
}

export default function Feed() {
  const [posts,   setPosts]   = useState<Post[]>([])
  const [pending, setPending] = useState<Post[]>([])
  const [newIds,  setNewIds]  = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  function load() {
    setLoading(true)
    fetchPosts()
      .then(setPosts)
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()

    // Own post submitted — show immediately, no banner
    function handleOwn(e: Event) {
      const post = (e as CustomEvent<Post>).detail
      setPosts(prev => [post, ...prev])
      setNewIds(new Set([post.id]))
      setTimeout(() => setNewIds(new Set()), 3500)
    }
    window.addEventListener('post-submitted', handleOwn)

    // Other users' posts — queue in banner
    const channel = supabase
      .channel('posts-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        const incoming = payload.new as Post
        // Skip if we already added it via the own-post event
        setPosts(current => {
          if (current.find(p => p.id === incoming.id)) return current
          setPending(prev => [incoming, ...prev])
          return current
        })
      })
      .subscribe()

    return () => {
      window.removeEventListener('post-submitted', handleOwn)
      supabase.removeChannel(channel)
    }
  }, [])

  function showPending() {
    setNewIds(new Set(pending.map(p => p.id)))
    setPosts(prev => [...pending, ...prev])
    setPending([])
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => setNewIds(new Set()), 3500)
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Feed header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">The Feed</h2>
          <p className="text-zinc-400 text-sm font-medium mt-0.5">What we are doing now</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            {loading ? 'Loading…' : `${posts.length} ship${posts.length === 1 ? '' : 's'} so far`}
          </p>
        </div>

        {!loading && posts.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 inline-block" />
            newest first
          </div>
        )}
      </div>

      <div ref={topRef} />

      {/* New posts banner */}
      {pending.length > 0 && (
        <button
          onClick={showPending}
          className="w-full mb-5 flex items-center justify-center gap-2 py-3 text-sm font-semibold
                     text-emerald-400 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl
                     hover:bg-emerald-500/15 hover:border-emerald-500/30
                     active:scale-[0.99]
                     transition-all duration-150 animate-bounce-in"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
          </svg>
          {pending.length} new ship{pending.length > 1 ? 's' : ''} — tap to reveal
        </button>
      )}

      {/* States */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-sm mb-3">{error}</p>
          <button
            onClick={() => { setError(null); load() }}
            className="text-xs text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-24">
          <div className="text-4xl mb-4 select-none">🚀</div>
          <p className="text-zinc-400 text-sm font-semibold mb-1">Nothing shipped yet.</p>
          <p className="text-zinc-700 text-xs">Be the first — submit yours on the left.</p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map(post => (
            <PostCard key={post.id} post={post} animateIn={newIds.has(post.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

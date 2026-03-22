'use client'

import { useEffect, useState } from 'react'
import { supabase, fetchPosts } from '@/lib/supabase'
import PostCard from '@/components/PostCard'
import type { Post } from '@/types'

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          setPosts((prev) => [payload.new as Post, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-zinc-700" />
              <div className="h-3 bg-zinc-700 rounded w-24" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-zinc-800 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10 text-zinc-500 text-sm">
        {error}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-14">
        <p className="text-zinc-400 text-sm font-medium">Be the first to ship something.</p>
        <p className="text-zinc-600 text-xs mt-1">Your post will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500 mb-4">{posts.length} ship{posts.length === 1 ? '' : 's'} so far</p>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

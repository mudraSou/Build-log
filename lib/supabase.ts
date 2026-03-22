import { createClient } from '@supabase/supabase-js'
import type { Post } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function insertPost(
  name: string,
  description: string,
  link: string | null
): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({ name, description, link })
    .select()
    .single()

  if (error) throw error
  return data
}

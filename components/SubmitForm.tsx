'use client'

import { useState } from 'react'
import { insertPost } from '@/lib/supabase'

const DESC_MAX = 280

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function sanitize(str: string): string {
  return str.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

export default function SubmitForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [errors, setErrors] = useState<{ name?: string; description?: string; link?: string }>({})

  function clearError(field: keyof typeof errors) {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!description.trim()) errs.description = 'Description is required'
    if (link.trim() && !isValidUrl(link.trim())) errs.link = 'Must be a valid URL (include https://)'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      await insertPost(sanitize(name), sanitize(description), link.trim() || null)
      setName('')
      setDescription('')
      setLink('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 1800)
      showToast('success', 'Shipped! Your post is live.')
    } catch {
      showToast('error', 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const remaining = DESC_MAX - description.length
  const counterColor =
    remaining < 10 ? 'text-red-400' : remaining < 40 ? 'text-amber-400' : 'text-zinc-600'

  return (
    <>
      {toast && (
        <div
          key={toast.message}
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium shadow-xl animate-slide-down ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4"
      >
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError('name') }}
            placeholder="e.g. Alex"
            className={`w-full bg-zinc-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors ${
              errors.name ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-zinc-500 focus:border-zinc-500'
            }`}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-zinc-400" htmlFor="description">
              What did you build?
            </label>
            <span className={`text-xs tabular-nums ${counterColor}`}>{remaining}</span>
          </div>
          <textarea
            id="description"
            value={description}
            onChange={(e) => { setDescription(e.target.value.slice(0, DESC_MAX)); clearError('description') }}
            placeholder="Describe what you shipped..."
            rows={3}
            className={`w-full bg-zinc-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors resize-none ${
              errors.description ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-zinc-500 focus:border-zinc-500'
            }`}
          />
          {errors.description && <p className="text-red-400 text-xs mt-1.5">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5" htmlFor="link">
            Link <span className="text-zinc-600 font-normal">(optional)</span>
          </label>
          <input
            id="link"
            type="text"
            value={link}
            onChange={(e) => { setLink(e.target.value); clearError('link') }}
            placeholder="https://..."
            className={`w-full bg-zinc-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors ${
              errors.link ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-zinc-500 focus:border-zinc-500'
            }`}
          />
          {errors.link && <p className="text-red-400 text-xs mt-1.5">{errors.link}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || submitted}
          className={`w-full font-semibold text-sm py-2.5 rounded-lg transition-all min-h-[44px] flex items-center justify-center gap-2 ${
            submitted
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-60 disabled:cursor-not-allowed'
          }`}
        >
          {submitted ? (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Shipped!
            </>
          ) : loading ? (
            <>
              <Spinner />
              Posting...
            </>
          ) : (
            'Ship it →'
          )}
        </button>
      </form>
    </>
  )
}

'use client'

import { useState } from 'react'
import { insertPost } from '@/lib/supabase'

const DESC_MAX = 280

function isValidUrl(v: string) {
  try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:' }
  catch { return false }
}
function sanitize(s: string) {
  return s.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

type FieldErrors = { name?: string; title?: string; description?: string; link?: string }

function Field({
  id, label, optional, error, delay = 0, children,
}: {
  id: string; label: string; optional?: boolean; error?: string; delay?: number; children: React.ReactNode
}) {
  return (
    <div
      className="group/field relative animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Left accent line — lights up on focus */}
      <div className="absolute -left-4 top-6 bottom-0 w-0.5 rounded-full
                      bg-zinc-800 group-focus-within/field:bg-white/25
                      transition-all duration-300" />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="text-[11px] font-semibold uppercase tracking-widest
                       text-zinc-600 group-focus-within/field:text-zinc-300
                       group-focus-within/field:translate-x-0.5
                       transition-all duration-200"
          >
            {label}
            {optional && (
              <span className="ml-1.5 normal-case tracking-normal font-normal text-zinc-700">
                (optional)
              </span>
            )}
          </label>
        </div>

        {children}

        {error && (
          <p className="text-red-400 text-xs animate-slide-down flex items-center gap-1 mt-1">
            <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

const inputBase =
  'w-full bg-zinc-900/80 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-700 ' +
  'focus:outline-none focus:ring-2 ' +
  'hover:border-zinc-600 hover:bg-zinc-900 ' +
  'transition-all duration-150'

const inputNormal =
  inputBase +
  ' border-zinc-800 focus:ring-white/8 focus:border-zinc-600 focus:bg-zinc-900 ' +
  'focus:shadow-[0_0_0_4px_rgba(255,255,255,0.03),0_0_24px_rgba(255,255,255,0.02)]'

const inputErrorCls =
  inputBase +
  ' border-red-500/50 focus:ring-red-500/20 focus:border-red-500/60 animate-shake'

export default function SubmitForm() {
  const [name, setName]               = useState('')
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink]               = useState('')
  const [loading, setLoading]         = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [toast, setToast]             = useState<{ type: 'success'|'error'; msg: string }|null>(null)
  const [errors, setErrors]           = useState<FieldErrors>({})
  const [shakeKey, setShakeKey]       = useState(0)

  function clearErr(f: keyof FieldErrors) {
    if (errors[f]) setErrors(e => ({ ...e, [f]: undefined }))
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {}
    if (!name.trim())        e.name        = 'Name is required'
    if (!title.trim())       e.title       = 'Give your ship a headline'
    if (!description.trim()) e.description = 'Tell us what you built'
    if (link.trim() && !isValidUrl(link.trim())) e.link = 'Must be a valid URL (https://...)'
    return e
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      setShakeKey(k => k + 1)   // re-trigger shake animation
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await insertPost(sanitize(name), sanitize(title), sanitize(description), link.trim() || null)
      setName(''); setTitle(''); setDescription(''); setLink('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 1800)
      showToast('success', 'Shipped! Your post is live 🚀')
    } catch {
      showToast('error', 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function showToast(type: 'success'|'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3800)
  }

  const remaining = DESC_MAX - description.length
  const counterColor =
    remaining < 10  ? 'text-red-400 scale-110' :
    remaining < 50  ? 'text-amber-400' :
    'text-zinc-700'

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          key={toast.msg}
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl
                      text-sm font-medium shadow-2xl animate-bounce-in ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success'
            ? <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          }
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 pl-4">

        {/* Name */}
        <Field id="name" label="Your name" error={errors.name} delay={0}>
          <input
            id="name" type="text" value={name} placeholder="e.g. Alex Chen"
            onChange={e => { setName(e.target.value); clearErr('name') }}
            className={errors.name ? `${inputErrorCls} [animation-iteration-count:1]` : inputNormal}
            key={errors.name ? `name-err-${shakeKey}` : 'name'}
          />
        </Field>

        {/* Title */}
        <Field id="title" label="Headline" error={errors.title} delay={60}>
          <input
            id="title" type="text" value={title}
            placeholder="e.g. Launched my SaaS in a weekend"
            onChange={e => { setTitle(e.target.value); clearErr('title') }}
            className={errors.title ? `${inputErrorCls} [animation-iteration-count:1]` : inputNormal}
            key={errors.title ? `title-err-${shakeKey}` : 'title'}
          />
        </Field>

        {/* Description */}
        <Field id="description" label="What you built" error={errors.description} delay={120}>
          <div className="relative">
            <textarea
              id="description" rows={4} value={description}
              placeholder="Walk us through what you made, the problem it solves, or what surprised you..."
              onChange={e => { setDescription(e.target.value.slice(0, DESC_MAX)); clearErr('description') }}
              className={`${errors.description ? `${inputErrorCls} [animation-iteration-count:1]` : inputNormal} resize-none pr-12`}
              key={errors.description ? `desc-err-${shakeKey}` : 'description'}
            />
            <span className={`absolute bottom-2.5 right-3 text-[11px] tabular-nums
                              pointer-events-none transition-all duration-150 ${counterColor}`}>
              {remaining}
            </span>
          </div>
        </Field>

        {/* Link */}
        <Field id="link" label="Link" optional error={errors.link} delay={180}>
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <svg className="h-3.5 w-3.5 text-zinc-600 group-focus-within/field:text-zinc-400 transition-colors duration-200"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <input
              id="link" type="text" value={link} placeholder="https://..."
              onChange={e => { setLink(e.target.value); clearErr('link') }}
              className={`${errors.link ? `${inputErrorCls} [animation-iteration-count:1]` : inputNormal} pl-9`}
              key={errors.link ? `link-err-${shakeKey}` : 'link'}
            />
          </div>
        </Field>

        {/* Submit */}
        <div className="animate-fade-up pt-1" style={{ animationDelay: '240ms' }}>
          <button
            type="submit"
            disabled={loading || submitted}
            className={`
              btn-shimmer
              w-full font-semibold text-sm py-3 rounded-xl min-h-[48px]
              flex items-center justify-center gap-2
              transition-all duration-200
              hover:scale-[1.025] active:scale-[0.975]
              disabled:cursor-not-allowed
              ${submitted
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white text-zinc-900 hover:bg-zinc-100 hover:shadow-xl hover:shadow-white/10 disabled:opacity-50'
              }
            `}
          >
            {submitted ? (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Shipped!
              </>
            ) : loading ? (
              <><Spinner /> Posting...</>
            ) : (
              <>
                Ship it
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )
}

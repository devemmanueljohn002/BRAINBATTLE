'use client'
import { useState } from 'react'
import Link from 'next/link'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'
import { apiFetch } from '@/lib/api'
export default function Login() {
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr('')
    const f = new FormData(e.currentTarget)
    try {
      const { data: j } = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ loginId: f.get('loginId'), password: f.get('password') }),
      })
      const role = j && typeof j === 'object' && 'role' in j
        ? (j as { role?: unknown }).role
        : undefined
      if (role !== 'ADMIN' && role !== 'TEACHER' && role !== 'STUDENT') {
        console.error('[BRAINBATTLE login] Invalid authentication response', { responseType: typeof j })
        setErr('The server returned an invalid login response. Please try again later.')
        return
      }
      location.assign({ ADMIN: '/admin', TEACHER: '/teacher', STUDENT: '/student' }[role])
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Unable to connect. Please check your internet connection and try again.')
    } finally {
      setBusy(false)
    }
  }
  return <main className="login-page"><section className="login-card">
    <BrainBattleLogo width={132} priority />
    <p className="login-tagline">THINK FAST. PLAY SMART. WIN BIG.</p>
    <h1>Welcome to BRAINBATTLE</h1>
    <p className="mut">Sign in and get ready to compete.</p>
    <form onSubmit={submit} className="row login-form" style={{ flexDirection: 'column' }}>
      <label>Student ID or staff ID<input name="loginId" required autoComplete="username" style={{ width: '100%' }} /></label>
      <label>Password<input name="password" type="password" required autoComplete="current-password" style={{ width: '100%' }} /></label>
      {err && <div className="err" role="alert">{err}</div>}
      <button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <Link href="/" className="login-home-link">Back to home</Link>
  </section></main>
}

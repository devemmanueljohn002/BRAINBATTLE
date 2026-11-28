'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'
import { apiFetch } from '@/lib/api'
export default function Login() {
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  useEffect(() => {
    const remembered = window.localStorage.getItem('brainbattle.rememberedUsername')
    if (remembered) {
      const input = document.querySelector<HTMLInputElement>('input[name="loginId"]')
      if (input) input.value = remembered
      const checkbox = document.querySelector<HTMLInputElement>('input[name="rememberUsername"]')
      if (checkbox) checkbox.checked = true
    }
  }, [])
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr('')
    const f = new FormData(e.currentTarget)
    const loginId = String(f.get('loginId') || '')
    if (f.get('rememberUsername')) window.localStorage.setItem('brainbattle.rememberedUsername', loginId)
    else window.localStorage.removeItem('brainbattle.rememberedUsername')
    try {
      const { data: j } = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ loginId: f.get('loginId'), password: f.get('password') }),
      })
      const role = j && typeof j === 'object' && 'role' in j
        ? (j as { role?: unknown }).role
        : undefined
      if (!['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN', 'PLATFORM_SUPPORT', 'QUIZ_MANAGER', 'STUDENT_MANAGER', 'TEACHER', 'STUDENT'].includes(String(role))) {
        console.error('[BRAINBATTLE login] Invalid authentication response', { responseType: typeof j })
        setErr('The server returned an invalid login response. Please try again later.')
        return
      }
      const destination =
        role === 'STUDENT' ? '/student'
        : role === 'TEACHER' ? '/teacher'
        : role === 'SCHOOL_ADMIN' ? '/school-admin/dashboard'
        : role === 'SUPER_ADMIN' ? '/super-admin/dashboard'
        : '/admin'
      location.assign(destination)
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
      <label>Password
        <div className="row" style={{ flexWrap: 'nowrap', margin: 0 }}>
          <input name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" style={{ width: '100%' }} />
          <button className="sec" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button>
        </div>
      </label>
      <div className="row" style={{ justifyContent: 'space-between', margin: 0 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
          <input type="checkbox" name="rememberUsername" /> Remember username
        </label>
        <Link href="/forgot-password" className="login-home-link" style={{ margin: 0 }}>Forgot password?</Link>
      </div>
      {err && <div className="err" role="alert">{err}</div>}
      <button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <Link href="/" className="login-home-link">Back to home</Link>
  </section></main>
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'
import { apiFetch } from '@/lib/api'

export default function Login() {
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [username, setUsername] = useState('')

  useEffect(() => {
    setUsername(window.localStorage.getItem('brainbattle.rememberedUsername') || '')
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setErr('')
    const form = new FormData(event.currentTarget)
    const loginId = String(form.get('loginId') || '').trim()
    if (remember) window.localStorage.setItem('brainbattle.rememberedUsername', loginId)
    else window.localStorage.removeItem('brainbattle.rememberedUsername')

    try {
      const { data } = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          loginId,
          password: form.get('password'),
          rememberMe: remember,
        }),
      })
      const role = data && typeof data === 'object' && 'role' in data
        ? (data as { role?: unknown }).role
        : undefined
      if (!['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN', 'PLATFORM_SUPPORT', 'QUIZ_MANAGER', 'STUDENT_MANAGER', 'TEACHER', 'STUDENT'].includes(String(role))) {
        console.error('[BRAINBATTLE login] Invalid authentication response', { responseType: typeof data })
        setErr('The server returned an invalid login response. Please try again later.')
        return
      }
      const destination =
        role === 'STUDENT' ? '/student/dashboard'
        : role === 'TEACHER' ? '/teacher'
        : role === 'SCHOOL_ADMIN' ? '/school-admin/dashboard'
        : role === 'SUPER_ADMIN' ? '/super-admin/dashboard'
        : '/admin'
      location.assign(destination)
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Unable to connect. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="login-page">
    <div className="login-layout">
      <section className="login-story" aria-label="About BRAINBATTLE">
        <BrainBattleLogo width={116} priority />
        <p className="login-eyebrow">THE SCHOOL ARENA</p>
        <h1>Empowering Schools.<br />Challenging Minds.<br /><span>Building Champions.</span></h1>
        <p>One platform for school management, computer-based examinations, academic quizzes, competitions, and student performance.</p>
        <div className="login-role-note">Secure access for school administrators, teachers, and students.</div>
      </section>
      <section className="login-card">
        <p className="login-eyebrow">WELCOME BACK</p>
        <h2>Sign in to BRAINBATTLE</h2>
        <p className="mut">Use your email address or username to continue.</p>
        <form onSubmit={submit} className="row login-form" style={{ flexDirection: 'column' }}>
          <label>Email address or username<input name="loginId" required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
          <label>Password
            <div className="row login-password-row">
              <input name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" />
              <button className="sec" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </label>
          <div className="row login-options">
            <label className="login-check"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>
          {err && <div className="err" role="alert">{err}</div>}
          <button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="login-register-prompt">New to BRAINBATTLE? <Link href="/register">Create an account</Link></p>
        <Link href="/" className="login-home-link">Back to home</Link>
      </section>
    </div>
  </main>
}

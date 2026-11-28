'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'

function ResetPasswordForm() {
  const params = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [show, setShow] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setMessage('')
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') || '')
    if (password !== String(form.get('confirmPassword') || '')) {
      setBusy(false); return setMessage('Passwords do not match')
    }
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.get('token') || '', password }),
    })
    setBusy(false)
    setMessage(res.ok ? 'Password reset successfully' : (await res.json()).error || 'Unable to reset password')
  }
  return <main className="login-page"><section className="login-card">
    <BrainBattleLogo width={132} priority /><h1>Reset Password</h1>
    <form className="row login-form" style={{ flexDirection: 'column' }} onSubmit={submit}>
      <label>New password<input name="password" type={show ? 'text' : 'password'} required minLength={8} /></label>
      <label>Confirm password<input name="confirmPassword" type={show ? 'text' : 'password'} required minLength={8} /></label>
      <button className="sec" type="button" onClick={() => setShow((value) => !value)}>{show ? 'Hide' : 'Show'} passwords</button>
      {message && <p role="status">{message}</p>}
      <button disabled={busy}>{busy ? 'Saving…' : 'Reset password'}</button>
    </form>
    <Link href="/login" className="login-home-link">Back to login</Link>
  </section></main>
}

export default function ResetPassword() {
  return <Suspense fallback={<main className="login-page"><p className="mut">Loading password reset…</p></main>}><ResetPasswordForm /></Suspense>
}

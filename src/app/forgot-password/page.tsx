'use client'

import { useState } from 'react'
import Link from 'next/link'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'

export default function ForgotPassword() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setMessage('')
    const form = new FormData(event.currentTarget)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: form.get('loginId') }),
    })
    const data = await res.json()
    setBusy(false)
    setMessage(res.ok ? 'If the account exists, password reset instructions will be sent.' : data.error || 'Unable to request reset')
  }
  return <main className="login-page"><section className="login-card">
    <BrainBattleLogo width={132} priority /><h1>Forgot Password</h1>
    <form className="row login-form" style={{ flexDirection: 'column' }} onSubmit={submit}>
      <label>Username or email<input name="loginId" required /></label>
      {message && <p role="status">{message}</p>}
      <button disabled={busy}>{busy ? 'Submitting…' : 'Request password reset'}</button>
    </form>
    <Link href="/login" className="login-home-link">Back to login</Link>
  </section></main>
}

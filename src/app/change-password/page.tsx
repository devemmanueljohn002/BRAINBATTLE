'use client'

import { useState } from 'react'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'

export default function ChangePassword() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [show, setShow] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setMessage('')
    const form = new FormData(event.currentTarget)
    const newPassword = String(form.get('newPassword') || '')
    if (newPassword !== String(form.get('confirmPassword') || '')) {
      setBusy(false); return setMessage('New passwords do not match')
    }
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: form.get('currentPassword'), newPassword }),
    })
    setBusy(false)
    setMessage(res.ok ? 'Password changed successfully' : (await res.json()).error || 'Unable to change password')
  }
  return <main className="login-page"><section className="login-card">
    <BrainBattleLogo width={132} priority /><h1>Change Password</h1>
    <form className="row login-form" style={{ flexDirection: 'column' }} onSubmit={submit}>
      <label>Current password<input name="currentPassword" type={show ? 'text' : 'password'} required /></label>
      <label>New password<input name="newPassword" type={show ? 'text' : 'password'} required minLength={8} /></label>
      <label>Confirm new password<input name="confirmPassword" type={show ? 'text' : 'password'} required minLength={8} /></label>
      <button className="sec" type="button" onClick={() => setShow((value) => !value)}>{show ? 'Hide' : 'Show'} passwords</button>
      {message && <p role="status">{message}</p>}
      <button disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
    </form>
  </section></main>
}

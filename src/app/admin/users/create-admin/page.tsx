'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CreateAdmin() {
  const [current, setCurrent] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => { fetch('/api/auth/me').then((res) => res.ok ? res.json() : null).then(setCurrent) }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setMessage('')
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') || '')
    if (password !== String(form.get('confirmPassword') || '')) {
      setBusy(false); return setMessage('Passwords do not match')
    }
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.get('fullName'),
        loginId: form.get('loginId'),
        email: form.get('email') || null,
        phone: form.get('phone') || null,
        role: form.get('role'),
        password: password || null,
      }),
    })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) return setMessage(data.error || 'Unable to create administrator')
    setMessage(data.temporaryPassword
      ? `Administrator created. Temporary password: ${data.temporaryPassword}`
      : 'Administrator created successfully')
    ;(event.target as HTMLFormElement).reset()
  }

  const roleOptions = current?.role === 'SUPER_ADMIN'
    ? [
        ['SUPER_ADMIN', 'Super Admin', 'Complete system access'],
        ['ADMIN', 'Admin', 'Students, quizzes, competitions and results'],
        ['QUIZ_MANAGER', 'Quiz Manager', 'Questions, quizzes and quiz results'],
        ['STUDENT_MANAGER', 'Student Manager', 'Student accounts and performance'],
      ]
    : [
        ['ADMIN', 'Admin', 'Students, quizzes, competitions and results'],
        ['QUIZ_MANAGER', 'Quiz Manager', 'Questions, quizzes and quiz results'],
        ['STUDENT_MANAGER', 'Student Manager', 'Student accounts and performance'],
      ]

  return <main className="portal-main"><h1>Create Administrator</h1>
    <form className="card" onSubmit={submit}>
      <h2>Account information</h2>
      <div className="row">
        <input name="fullName" required minLength={2} placeholder="Full name" />
        <input name="loginId" required minLength={2} placeholder="Username" />
        <input name="email" type="email" placeholder="Email" />
        <input name="phone" placeholder="Phone number (optional)" />
      </div>
      <div className="row">
        <select name="role" required defaultValue="ADMIN">
          {roleOptions.map(([value, label, description]) => <option key={value} value={value}>{label} — {description}</option>)}
        </select>
        <select name="status" defaultValue="ACTIVE"><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select>
      </div>
      <div className="row">
        <input name="password" type={showPassword ? 'text' : 'password'} minLength={8} placeholder="Password (blank = generate)" />
        <input name="confirmPassword" type={showPassword ? 'text' : 'password'} minLength={8} placeholder="Confirm password" />
        <button className="sec" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'} passwords</button>
      </div>
      {message && <p role="status">{message}</p>}
      <div className="row"><button disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button><Link href="/admin/users"><button className="sec" type="button">Cancel</button></Link></div>
    </form>
  </main>
}

'use client'

import { useEffect, useState } from 'react'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'

export default function RegisterStudent() {
  const [options, setOptions] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetch('/api/auth/registration-options').then((res) => res.json()).then(setOptions)
  }, [])

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    if (form.get('password') !== form.get('confirmPassword')) {
      setBusy(false)
      return setMessage('Passwords do not match')
    }
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentCode: form.get('studentCode'),
        username: form.get('username') || null,
        fullName: form.get('fullName'),
        email: form.get('email'),
        phone: form.get('phone') || null,
        classId: form.get('classId'),
        classArm: form.get('classArm') || null,
        academicSession: form.get('academicSession') || null,
        gender: form.get('gender') || null,
        password: form.get('password'),
      }),
    })
    const data = await res.json()
    setBusy(false)
    setMessage(res.ok ? data.message : data.error || 'Registration failed')
  }

  return <main className="login-page"><section className="login-card">
    <BrainBattleLogo width={132} priority />
    <h1>Student Registration</h1>
    {!options ? <p className="mut">Loading registration settings…</p> :
      !options.enabled ? <p role="alert">Student registration is currently closed. Please contact your school administrator to obtain your BRAINBATTLE account.</p> :
      <form className="row login-form" style={{ flexDirection: 'column' }} onSubmit={submitForm}>
        <label>Full name<input name="fullName" required minLength={2} /></label>
        <label>Student ID<input name="studentCode" required minLength={2} /></label>
        <label>Username<input name="username" required minLength={2} /></label>
        <label>Email<input name="email" type="email" required={Boolean(options.requireEmail)} /></label>
        <label>Phone number<input name="phone" /></label>
        <label>Class<select name="classId" required defaultValue=""><option value="" disabled>Select class</option>
          {options.classes.map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select></label>
        <label>Class arm<input name="classArm" placeholder="A, B, C…" /></label>
        <label>Academic session<input name="academicSession" placeholder="2026/2027" /></label>
        <label>Gender<select name="gender" defaultValue=""><option value="">Prefer not to say</option><option value="M">Male</option><option value="F">Female</option></select></label>
        <label>Password<div className="row" style={{ flexWrap: 'nowrap', margin: 0 }}>
          <input name="password" type={showPassword ? 'text' : 'password'} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="sec" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button>
        </div></label>
        <p className="mut" style={{ margin: 0 }}>Strength: {password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : 'Needs work'}</p>
        <label>Confirm password<input name="confirmPassword" type={showPassword ? 'text' : 'password'} required minLength={8} /></label>
        {message && <div className="err" role="status">{message}</div>}
        <button disabled={busy}>{busy ? 'Submitting…' : 'Register student'}</button>
      </form>}
  </section></main>
}

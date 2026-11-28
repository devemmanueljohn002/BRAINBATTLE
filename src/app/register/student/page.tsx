'use client'

import { useState } from 'react'
import Link from 'next/link'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'

type RegistrationOptions = {
  enabled: boolean
  requiresApproval: boolean
  requireEmail: boolean
  requireStudentId: boolean
  school: { name: string; code: string } | null
  classes: Array<{ id: string; name: string; category: string }>
}

export default function RegisterStudent() {
  const [options, setOptions] = useState<RegistrationOptions | null>(null)
  const [schoolCode, setSchoolCode] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [message, setMessage] = useState('')
  const [submittedStatus, setSubmittedStatus] = useState('')
  const [submittedLoginId, setSubmittedLoginId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')

  async function loadOptions() {
    const code = schoolCode.trim()
    setOptions(null)
    setSchoolName('')
    setError('')
    if (!code) return
    try {
      const response = await fetch(`/api/auth/registration-options?schoolCode=${encodeURIComponent(code)}`)
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || data.detail || 'We could not verify this school code.')
        return
      }
      setOptions(data as RegistrationOptions)
      setSchoolName(data.school?.name || '')
    } catch {
      setError('Unable to load registration details. Please try again.')
    }
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!options?.school) {
      setError('Verify your school code before submitting.')
      return
    }
    setBusy(true)
    setMessage('')
    setError('')
    const form = new FormData(event.currentTarget)
    if (form.get('password') !== form.get('confirmPassword')) {
      setBusy(false)
      setError('Passwords do not match.')
      return
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentCode: form.get('studentCode'),
          username: form.get('username') || null,
          fullName: form.get('fullName'),
          email: form.get('email') || null,
          phone: form.get('phone') || null,
          schoolCode: form.get('schoolCode'),
          classId: form.get('classId'),
          classArm: form.get('classArm') || null,
          academicSession: form.get('academicSession') || null,
          gender: form.get('gender') || null,
          password: form.get('password'),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || data.detail || 'Student registration failed.')
        return
      }
      setMessage(data.message || (data.status === 'PENDING'
        ? 'Registration received. Your account is awaiting approval from your school administrator.'
        : 'Registration complete. You can now sign in.'))
      setSubmittedStatus(data.status)
      setSubmittedLoginId(data.loginId)
    } catch {
      setError('Unable to connect to BRAINBATTLE. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="login-page">
    <section className="register-form-card register-form-narrow">
      <Link href="/register" className="login-home-link">← Account types</Link>
      <BrainBattleLogo width={92} priority />
      <p className="login-eyebrow">STUDENT</p>
      <h1>Join your school</h1>
      <p className="mut">Enter the school code provided by your school to see its available classes.</p>
      {message ? <div className="registration-success" role="status">
        <h2>{submittedStatus === 'PENDING' ? 'Registration received' : 'Registration complete'}</h2><p>{message}</p>
        <p>School: <b>{schoolName}</b></p>
        {submittedLoginId && <p>Login ID: <b>{submittedLoginId}</b></p>}
        <Link className="register-cta" href="/login">Go to login</Link>
      </div> : <>
        <div className="registration-code-block">
          <label>School code<div className="registration-code-field">
            <input value={schoolCode} onChange={(event) => { setSchoolCode(event.target.value); setOptions(null); setSchoolName('') }} required minLength={4} maxLength={40} />
            <button type="button" className="sec" onClick={loadOptions} disabled={!schoolCode.trim()}>Find school</button>
          </div></label>
          {schoolName && <p className="registration-school-valid" role="status">School: {schoolName}</p>}
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        {options && !options.enabled && <p className="err" role="status">Student registration is currently closed. Please contact your school administrator.</p>}
        {options?.enabled && options.classes.length === 0 && <p className="mut" role="status">No classes are currently available for this school. Please contact the school administrator.</p>}
        {options?.enabled && options.classes.length > 0 && <form className="registration-form" onSubmit={submitForm}>
          <input type="hidden" name="schoolCode" value={options.school?.code || schoolCode} />
          <label>Full name<input name="fullName" required minLength={2} maxLength={120} autoComplete="name" /></label>
          {options.requireStudentId && <label>Student ID<input name="studentCode" required minLength={2} maxLength={40} /></label>}
          {!options.requireStudentId && <label>Student ID <span className="mut">(optional)</span><input name="studentCode" minLength={2} maxLength={40} /></label>}
          <label>Username <span className="mut">(optional)</span><input name="username" minLength={2} maxLength={60} autoComplete="username" /></label>
          <label>Email address{options.requireEmail ? '' : ' (optional)'}<input name="email" type="email" required={options.requireEmail} maxLength={254} autoComplete="email" /></label>
          <label>Phone number <span className="mut">(optional)</span><input name="phone" type="tel" maxLength={40} /></label>
          <label>Class<select name="classId" required defaultValue=""><option value="" disabled>Select class</option>
            {options.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select></label>
          <label>Class arm <span className="mut">(optional)</span><input name="classArm" maxLength={40} placeholder="A, B, C…" /></label>
          <label>Academic session <span className="mut">(optional)</span><input name="academicSession" maxLength={32} placeholder="2026/2027" /></label>
          <label>Gender <span className="mut">(optional)</span><select name="gender" defaultValue=""><option value="">Prefer not to say</option><option value="M">Male</option><option value="F">Female</option></select></label>
          <label>Password<div className="row login-password-row">
            <input name="password" type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={100} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
            <button className="sec" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
          </div></label>
          <p className="mut registration-strength">Password strength: {password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : 'Needs work'}</p>
          <label>Confirm password<input name="confirmPassword" type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={100} autoComplete="new-password" /></label>
          <p className="mut">{options.requiresApproval ? 'Your account will be available after school administrator approval.' : 'You can sign in as soon as registration is complete.'}</p>
          <button disabled={busy}>{busy ? 'Submitting…' : 'Register student'}</button>
        </form>}
      </>}
      <p className="login-register-prompt">Already registered? <Link href="/login">Sign in</Link></p>
    </section>
  </main>
}

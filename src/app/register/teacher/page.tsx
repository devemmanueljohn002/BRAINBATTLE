'use client'

import { useState } from 'react'
import Link from 'next/link'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'

export default function RegisterTeacher() {
  const [schoolName, setSchoolName] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [checking, setChecking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function checkSchool() {
    const code = schoolCode.trim()
    setSchoolName('')
    if (!code) return
    setChecking(true)
    setError('')
    try {
      const response = await fetch(`/api/auth/schools/validate-code/${encodeURIComponent(code)}`)
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || data.detail || 'We could not verify this school code.')
        return
      }
      setSchoolName(data.school.name)
    } catch {
      setError('Unable to verify the school code. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (form.get('password') !== form.get('confirmPassword')) {
      setError('Passwords do not match.')
      return
    }
    if (!schoolName) {
      setError('Verify your school code before submitting.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/register-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.get('fullName'),
          email: form.get('email'),
          phone: form.get('phone') || null,
          password: form.get('password'),
          schoolCode: form.get('schoolCode'),
          department: form.get('department') || null,
          subjects: String(form.get('subjects') || '').split(',').map((item) => item.trim()).filter(Boolean),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || data.detail || 'Unable to submit teacher registration.')
        return
      }
      setSubmitted(true)
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
      {submitted ? <>
        <p className="login-eyebrow">REQUEST RECEIVED</p>
        <h1>Awaiting school approval</h1>
        <p className="mut">Your teacher account request for {schoolName} has been sent to the school administrator. You can sign in after approval.</p>
        <Link className="register-cta" href="/login">Go to login</Link>
      </> : <>
        <p className="login-eyebrow">TEACHER</p>
        <h1>Join your school</h1>
        <p className="mut">Teacher accounts are reviewed by the school administrator before access is enabled.</p>
        <form className="registration-form" onSubmit={submit}>
          <label>Full name<input name="fullName" required minLength={2} maxLength={160} autoComplete="name" /></label>
          <label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
          <label>Phone number <span className="mut">(optional)</span><input name="phone" type="tel" maxLength={40} /></label>
          <label>School code<div className="registration-code-field">
            <input name="schoolCode" required minLength={4} maxLength={40} value={schoolCode} onChange={(event) => { setSchoolCode(event.target.value); setSchoolName('') }} />
            <button type="button" className="sec" onClick={checkSchool} disabled={checking || !schoolCode.trim()}>{checking ? 'Checking…' : 'Verify code'}</button>
          </div></label>
          {schoolName && <p className="registration-school-valid" role="status">School: {schoolName}</p>}
          <label>Subject(s) taught <span className="mut">(optional, comma-separated)</span><input name="subjects" maxLength={500} placeholder="Mathematics, Physics" /></label>
          <label>Department <span className="mut">(optional)</span><input name="department" maxLength={120} /></label>
          <label>Password<input name="password" type="password" required minLength={8} maxLength={100} autoComplete="new-password" /></label>
          <label>Confirm password<input name="confirmPassword" type="password" required minLength={8} maxLength={100} autoComplete="new-password" /></label>
          {error && <p className="err" role="alert">{error}</p>}
          <button disabled={busy || checking}>{busy ? 'Submitting request…' : 'Request teacher account'}</button>
        </form>
        <p className="login-register-prompt">Already registered? <Link href="/login">Sign in</Link></p>
      </>}
    </section>
  </main>
}

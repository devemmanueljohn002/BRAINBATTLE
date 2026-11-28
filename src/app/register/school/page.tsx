'use client'

import { useState } from 'react'
import Link from 'next/link'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'

type RegistrationResult = {
  school: { name: string; code: string }
  administrator: { email: string }
  status: string
}

export default function RegisterSchool() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<RegistrationResult | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    if (form.get('password') !== form.get('confirmPassword')) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/register-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          abbreviation: form.get('abbreviation') || null,
          schoolType: form.get('schoolType'),
          country: form.get('country'),
          state: form.get('state') || null,
          lga: form.get('lga') || null,
          address: form.get('address') || null,
          phone: form.get('phone') || null,
          email: form.get('schoolEmail') || null,
          website: form.get('website') || null,
          logoUrl: form.get('logoUrl') || null,
          motto: form.get('motto') || null,
          adminFullName: form.get('adminFullName'),
          adminEmail: form.get('adminEmail'),
          adminPhone: form.get('adminPhone') || null,
          password: form.get('password'),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || data.detail || 'Unable to submit school registration.')
        return
      }
      setResult(data as RegistrationResult)
    } catch {
      setError('Unable to connect to BRAINBATTLE. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="login-page">
    <section className="register-form-card">
      <Link href="/register" className="login-home-link">← Account types</Link>
      <BrainBattleLogo width={92} priority />
      {result ? <>
        <p className="login-eyebrow">REGISTRATION RECEIVED</p>
        <h1>Your school registration is pending</h1>
        <p className="mut">Your school has been successfully registered on BRAINBATTLE. A platform administrator must approve it before school accounts can sign in.</p>
        <div className="registration-summary">
          <p><b>School</b><span>{result.school.name}</span></p>
          <p><b>School code</b><span>{result.school.code}</span></p>
          <p><b>Administrator email</b><span>{result.administrator.email}</span></p>
          <p><b>Status</b><span>{result.status}</span></p>
        </div>
        <Link className="register-cta" href="/login">Go to login</Link>
      </> : <>
        <p className="login-eyebrow">SCHOOL ADMINISTRATOR</p>
        <h1>Register your school</h1>
        <p className="mut">Your registration will be reviewed before access is activated.</p>
        <form className="registration-form" onSubmit={submit}>
          <h2>School information</h2>
          <div className="registration-fields">
            <label>School name<input name="name" required minLength={2} maxLength={200} /></label>
            <label>Abbreviation <span className="mut">(optional)</span><input name="abbreviation" maxLength={40} /></label>
            <label>School type<select name="schoolType" defaultValue="PRIVATE"><option value="PRIVATE">Private</option><option value="PUBLIC">Public</option><option value="PRIMARY">Primary</option><option value="JUNIOR_SECONDARY">Junior secondary</option><option value="SENIOR_SECONDARY">Senior secondary</option><option value="COMBINED">Combined</option><option value="OTHER">Other</option></select></label>
            <label>Country<input name="country" required maxLength={120} defaultValue="Nigeria" /></label>
            <label>State<input name="state" maxLength={120} /></label>
            <label>Local Government Area<input name="lga" maxLength={120} /></label>
            <label className="registration-field-wide">School address<input name="address" maxLength={1000} /></label>
            <label>School phone<input name="phone" type="tel" maxLength={40} /></label>
            <label>School email<input name="schoolEmail" type="email" maxLength={254} /></label>
            <label>Website <span className="mut">(optional)</span><input name="website" type="url" maxLength={2048} /></label>
            <label>School logo URL <span className="mut">(optional)</span><input name="logoUrl" type="url" maxLength={2048} /></label>
            <label>Motto <span className="mut">(optional)</span><input name="motto" maxLength={240} /></label>
          </div>
          <h2>Administrator information</h2>
          <div className="registration-fields">
            <label>Full name<input name="adminFullName" required minLength={2} maxLength={160} autoComplete="name" /></label>
            <label>Email address<input name="adminEmail" type="email" required maxLength={254} autoComplete="email" /></label>
            <label>Phone number<input name="adminPhone" type="tel" maxLength={40} /></label>
            <label>Password<input name="password" type="password" required minLength={8} maxLength={100} autoComplete="new-password" /></label>
            <label>Confirm password<input name="confirmPassword" type="password" required minLength={8} maxLength={100} autoComplete="new-password" /></label>
          </div>
          {error && <p className="err" role="alert">{error}</p>}
          <button disabled={busy}>{busy ? 'Submitting registration…' : 'Register school'}</button>
        </form>
        <p className="login-register-prompt">Already registered? <Link href="/login">Sign in</Link></p>
      </>}
    </section>
  </main>
}

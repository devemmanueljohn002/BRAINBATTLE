'use client'

import { useEffect, useState } from 'react'

export default function StudentProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [message, setMessage] = useState('')
  useEffect(() => { fetch('/api/auth/me').then((res) => res.ok ? res.json() : null).then(setProfile) }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.get('fullName'),
        email: form.get('email') || null,
        phone: form.get('phone') || null,
        classArm: form.get('classArm') || null,
        academicSession: form.get('academicSession') || null,
      }),
    })
    setMessage(res.ok ? 'Profile updated' : (await res.json()).error || 'Unable to update profile')
  }

  if (!profile) return <main className="portal-main"><p className="mut">Loading profile…</p></main>
  return <main className="portal-main"><h1>Student Profile</h1>
    {profile.student ? <form className="card" onSubmit={submit}>
      <div className="kpis"><div className="kpi"><b>{profile.student.fullName}</b><span>Student name</span></div><div className="kpi"><b>{profile.student.studentCode}</b><span>Student ID</span></div></div>
      <div className="row" style={{ marginTop: 16 }}>
        <input name="fullName" defaultValue={profile.student.fullName} required minLength={2} />
        <input name="email" type="email" defaultValue={profile.email || ''} placeholder="Email" />
        <input name="phone" defaultValue={profile.phone || ''} placeholder="Phone" />
        <input name="classArm" defaultValue={profile.student.classArm || ''} placeholder="Class arm" />
        <input name="academicSession" defaultValue={profile.student.academicSession || ''} placeholder="Academic session" />
      </div>
      {message && <p role="status">{message}</p>}
      <button>Save profile</button>
    </form> : <p className="err">No student profile is linked to this account.</p>}
  </main>
}

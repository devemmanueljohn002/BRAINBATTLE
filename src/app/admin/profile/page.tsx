'use client'

import { useEffect, useState } from 'react'

export default function AdminProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [message, setMessage] = useState('')
  useEffect(() => { fetch('/api/auth/me').then((res) => res.ok ? res.json() : null).then(setProfile) }, [])
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: form.get('fullName'), email: form.get('email') || null, phone: form.get('phone') || null }),
    })
    setMessage(res.ok ? 'Profile updated' : (await res.json()).error || 'Unable to update profile')
  }
  if (!profile) return <main className="portal-main"><p className="mut">Loading profile…</p></main>
  return <main className="portal-main"><h1>Administrator Profile</h1><form className="card" onSubmit={save}>
    <div className="kpis"><div className="kpi"><b>{profile.role}</b><span>Role</span></div><div className="kpi"><b>{profile.accountStatus}</b><span>Status</span></div></div>
    <div className="row" style={{ marginTop: 16 }}>
      <input name="fullName" defaultValue={profile.admin?.fullName || profile.loginId} required minLength={2} />
      <input name="email" type="email" defaultValue={profile.email || ''} placeholder="Email" />
      <input name="phone" defaultValue={profile.phone || ''} placeholder="Phone" />
    </div>
    {message && <p role="status">{message}</p>}<button>Save profile</button>
  </form></main>
}

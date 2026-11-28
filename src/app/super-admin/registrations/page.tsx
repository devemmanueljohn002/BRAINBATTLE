'use client'

import { useEffect, useState } from 'react'
import BrandLoader from '@/components/branding/BrandLoader'

type Registration = {
  school: {
    id: string
    name: string
    code: string
    country?: string | null
    state?: string | null
    lga?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
    createdAt: string
  }
  administrator: { fullName?: string | null; email?: string | null; phone?: string | null } | null
}

export default function SchoolRegistrations() {
  const [rows, setRows] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      const response = await fetch(`/api/platform/registrations?${params}`)
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || data.detail || 'Unable to load registrations.')
        return
      }
      setRows(data.rows)
    } catch {
      setMessage('Unable to connect while loading registrations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function decide(registration: Registration, action: 'approve' | 'reject') {
    const name = registration.school.name
    if (action === 'reject' && !confirm(`Reject the registration for ${name}?`)) return
    setBusyId(registration.school.id)
    setMessage('')
    try {
      const response = await fetch(`/api/platform/registrations/${registration.school.id}/${action}`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || data.detail || `Unable to ${action} school registration.`)
        return
      }
      setMessage(`${name} registration ${action === 'approve' ? 'approved and activated' : 'rejected'}.`)
      await load()
    } catch {
      setMessage(`Unable to ${action} school registration. Please retry.`)
    } finally {
      setBusyId('')
    }
  }

  return <main className="portal-main">
    <h1>School registration requests</h1>
    <p className="mut">Review newly registered schools before enabling administrator access.</p>
    {message && <p role="status">{message}</p>}
    <div className="row"><input aria-label="Search registrations" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search schools" />
      <button className="sec" onClick={load}>Search</button></div>
    {loading ? <BrandLoader message="Loading school registrations…" /> : rows.length === 0 ? <p className="mut">No school registrations are awaiting review.</p> :
      <div className="registration-review-list">{rows.map((registration) => <article className="card" key={registration.school.id}>
        <div className="registration-review-heading"><div><p className="login-eyebrow">PENDING REVIEW</p><h2>{registration.school.name}</h2></div>
          <span className="registration-status">{registration.school.code}</span></div>
        <div className="registration-summary">
          <p><b>Administrator</b><span>{registration.administrator?.fullName || '—'}</span></p>
          <p><b>Administrator email</b><span>{registration.administrator?.email || '—'}</span></p>
          <p><b>Administrator phone</b><span>{registration.administrator?.phone || '—'}</span></p>
          <p><b>Location</b><span>{[registration.school.lga, registration.school.state, registration.school.country].filter(Boolean).join(', ') || '—'}</span></p>
          <p><b>School phone</b><span>{registration.school.phone || '—'}</span></p>
          <p><b>School email</b><span>{registration.school.email || '—'}</span></p>
          <p><b>Address</b><span>{registration.school.address || '—'}</span></p>
          <p><b>Submitted</b><span>{new Date(registration.school.createdAt).toLocaleString()}</span></p>
        </div>
        <div className="row"><button disabled={busyId === registration.school.id} onClick={() => decide(registration, 'approve')}>{busyId === registration.school.id ? 'Working…' : 'Approve and activate'}</button>
          <button className="sec" disabled={busyId === registration.school.id} onClick={() => decide(registration, 'reject')}>Reject</button></div>
      </article>)}</div>}
  </main>
}

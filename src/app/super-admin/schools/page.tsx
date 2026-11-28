'use client'

import { useEffect, useState } from 'react'
import BrandLoader from '@/components/branding/BrandLoader'

export default function SchoolsPage() {
  const [schools, setSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (status) params.set('status', status)
    const res = await fetch(`/api/platform/schools?${params}`)
    setSchools(res.ok ? (await res.json()).rows : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const form = new FormData(event.currentTarget)
    const password = String(form.get('adminPassword') || '')
    const res = await fetch('/api/platform/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        abbreviation: form.get('abbreviation') || null,
        schoolType: form.get('schoolType'),
        address: form.get('address') || null,
        state: form.get('state') || null,
        lga: form.get('lga') || null,
        phone: form.get('phone') || null,
        email: form.get('email') || null,
        website: form.get('website') || null,
        motto: form.get('motto') || null,
        accessStatus: form.get('accessStatus'),
        subscriptionPlan: form.get('subscriptionPlan'),
        studentLimit: form.get('studentLimit') ? Number(form.get('studentLimit')) : null,
        teacherLimit: form.get('teacherLimit') ? Number(form.get('teacherLimit')) : null,
        adminFullName: form.get('adminFullName'),
        adminUsername: form.get('adminUsername'),
        adminEmail: form.get('adminEmail') || null,
        adminPhone: form.get('adminPhone') || null,
        adminPassword: password || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) return setMessage(data.error || 'Unable to create school')
    setMessage(data.administrator?.temporaryPassword
      ? `School created. Temporary administrator password: ${data.administrator.temporaryPassword}`
      : 'School and school administrator created')
    ;(event.target as HTMLFormElement).reset()
    load()
  }

  async function changeStatus(school: any, accessStatus: string) {
    if (!confirm(`Set ${school.name} to ${accessStatus}?`)) return
    const res = await fetch(`/api/platform/schools/${school.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessStatus }),
    })
    setMessage(res.ok ? `School status changed to ${accessStatus}` : (await res.json()).error || 'Unable to update school')
    load()
  }

  return <main className="portal-main"><h1>School Management</h1>
    {message && <p role="status">{message}</p>}
    <section className="card"><h2>Create school</h2><form onSubmit={submit}>
      <h3>School information</h3><div className="row">
        <input name="name" required minLength={2} placeholder="Official school name" />
        <input name="abbreviation" placeholder="Abbreviation" />
        <select name="schoolType" defaultValue="PRIVATE">
          <option value="PRIMARY">Primary School</option><option value="JUNIOR_SECONDARY">Junior Secondary School</option>
          <option value="SENIOR_SECONDARY">Senior Secondary School</option><option value="COMBINED">Combined Primary and Secondary</option>
          <option value="PRIVATE">Private School</option><option value="PUBLIC">Public School</option><option value="OTHER">Other</option>
        </select>
        <input name="address" placeholder="Address" /><input name="state" placeholder="State" /><input name="lga" placeholder="Local Government Area" />
        <input name="phone" placeholder="Contact phone" /><input name="email" type="email" placeholder="Contact email" /><input name="website" placeholder="Website" /><input name="motto" placeholder="Motto" />
      </div>
      <h3>Access</h3><div className="row">
        <select name="accessStatus" defaultValue="TRIAL"><option value="TRIAL">Trial</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="EXPIRED">Expired</option><option value="PENDING">Pending</option></select>
        <input name="subscriptionPlan" defaultValue="TRIAL" placeholder="Subscription plan" />
        <input name="studentLimit" type="number" min={0} placeholder="Student limit" />
        <input name="teacherLimit" type="number" min={0} placeholder="Teacher limit" />
      </div>
      <h3>First school administrator</h3><div className="row">
        <input name="adminFullName" required minLength={2} placeholder="Full name" />
        <input name="adminUsername" required minLength={2} placeholder="Username" />
        <input name="adminEmail" type="email" placeholder="Email" />
        <input name="adminPhone" placeholder="Phone" />
        <input name="adminPassword" type="password" minLength={8} placeholder="Temporary password (blank = generate)" />
      </div>
      <button>Create school and administrator</button>
    </form></section>
    <div className="row" style={{ marginTop: 20 }}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search schools" />
      <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="TRIAL">Trial</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="EXPIRED">Expired</option><option value="PENDING">Pending</option></select>
      <button className="sec" onClick={load}>Search</button>
    </div>
    {loading ? <BrandLoader message="Loading schools…" /> : <div style={{ overflowX: 'auto' }}><table><thead><tr><th>School</th><th>Code</th><th>Status</th><th>Plan</th><th>Limits</th><th>Actions</th></tr></thead><tbody>
      {schools.map((school) => <tr key={school.id}><td>{school.name}</td><td>{school.code}</td><td>{school.accessStatus}</td><td>{school.subscriptionPlan}</td><td>{school.studentLimit ?? 'Unlimited'} students · {school.teacherLimit ?? 'Unlimited'} teachers</td><td>
        {school.accessStatus === 'ACTIVE' ? <button className="sec" onClick={() => changeStatus(school, 'SUSPENDED')}>Suspend</button> :
          <button onClick={() => changeStatus(school, 'ACTIVE')}>Activate</button>}
        {' '}<button className="sec" onClick={() => changeStatus(school, 'TRIAL')}>Set trial</button>
      </td></tr>)}
    </tbody></table></div>}
  </main>
}

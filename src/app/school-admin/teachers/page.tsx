'use client'

import { useEffect, useState } from 'react'

export default function SchoolTeachers() {
  const [rows, setRows] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [message, setMessage] = useState('')
  async function load() {
    const [teachersResponse, requestsResponse] = await Promise.all([
      fetch('/api/admin/teachers'),
      fetch('/api/admin/teacher-registrations'),
    ])
    setRows(teachersResponse.ok ? await teachersResponse.json() : [])
    setRequests(requestsResponse.ok ? await requestsResponse.json() : [])
  }
  useEffect(() => { load() }, [])
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const res = await fetch('/api/admin/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: form.get('loginId'), fullName: form.get('fullName'), password: form.get('password') || null }),
    })
    setMessage(res.ok ? 'Teacher account created' : (await res.json()).error || 'Unable to create teacher')
    if (res.ok) { (event.target as HTMLFormElement).reset(); load() }
  }
  async function decide(request: any, action: 'approve' | 'reject') {
    if (action === 'reject' && !confirm(`Reject ${request.fullName}'s registration?`)) return
    const res = await fetch(`/api/admin/teacher-registrations/${request.id}/${action}`, { method: 'POST' })
    const data = await res.json()
    setMessage(res.ok ? `Teacher registration ${action === 'approve' ? 'approved' : 'rejected'}.` : data.error || data.detail || `Unable to ${action} registration.`)
    if (res.ok) load()
  }
  return <main className="portal-main"><h1>Teacher Management</h1><form className="card" onSubmit={submit}>
    <div className="row"><input name="fullName" required minLength={2} placeholder="Full name" /><input name="loginId" required minLength={2} placeholder="Username" /><input name="password" type="password" minLength={8} placeholder="Temporary password (blank = generate)" /><button>Create teacher</button></div>
    {message && <p role="status">{message}</p>}
  </form>
  {message && <p role="status">{message}</p>}
  <section className="card" style={{ marginTop: 18 }}><h2>Teacher registration requests</h2>
    {requests.length === 0 ? <p className="mut">No teacher registrations are awaiting approval.</p> :
      <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Subjects</th><th>Department</th><th>Requested</th><th>Actions</th></tr></thead><tbody>
        {requests.map((request) => <tr key={request.id}><td>{request.fullName}</td><td>{request.email}</td><td>{request.phone || '—'}</td>
          <td>{request.subjects?.join(', ') || '—'}</td><td>{request.department || '—'}</td><td>{new Date(request.createdAt).toLocaleDateString()}</td>
          <td><button onClick={() => decide(request, 'approve')}>Approve</button>{' '}<button className="sec" onClick={() => decide(request, 'reject')}>Reject</button></td></tr>)}
      </tbody></table></div>}
  </section>
  <div style={{ overflowX: 'auto', marginTop: 16 }}><table><thead><tr><th>Name</th><th>Username</th><th>Status</th><th>Subjects</th><th>Classes</th></tr></thead><tbody>
    {rows.map((row) => <tr key={row.id}><td>{row.fullName}</td><td>{row.loginId}</td><td>{row.accountStatus}</td>
      <td>{row.subjects?.join(', ') || '—'}</td><td>{row.classes?.map((item: any) => item.name).join(', ') || '—'}</td></tr>)}
  </tbody></table></div></main>
}

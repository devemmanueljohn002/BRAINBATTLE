'use client'

import { useEffect, useState } from 'react'
import BrandLoader from '@/components/branding/BrandLoader'

type StudentRegistration = {
  id: string
  studentCode: string
  fullName: string
  email?: string | null
  phone?: string | null
  className: string
  classArm?: string | null
  academicSession?: string | null
  createdAt: string
}

export default function StudentRegistrations() {
  const [rows, setRows] = useState<StudentRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/registrations')
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || data.detail || 'Unable to load registrations.')
        return
      }
      setRows(data)
    } catch {
      setMessage('Unable to connect while loading registrations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function decide(row: StudentRegistration, action: 'approve' | 'reject') {
    if (action === 'reject' && !confirm(`Reject ${row.fullName}'s registration?`)) return
    try {
      const response = await fetch(`/api/admin/registrations/${row.id}/${action}`, { method: 'POST' })
      const data = await response.json()
      setMessage(response.ok ? `Student registration ${action === 'approve' ? 'approved' : 'rejected'}.` : data.error || data.detail || `Unable to ${action} registration.`)
      if (response.ok) load()
    } catch {
      setMessage(`Unable to ${action} registration. Please retry.`)
    }
  }

  return <main className="portal-main">
    <h1>Student registration requests</h1>
    <p className="mut">Only requests associated with your school are shown here.</p>
    {message && <p role="status">{message}</p>}
    {loading ? <BrandLoader message="Loading student requests…" /> : rows.length === 0 ? <p className="mut">No student registrations are awaiting approval.</p> :
      <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Student</th><th>Student ID</th><th>Email</th><th>Class</th><th>Class arm</th><th>Academic session</th><th>Requested</th><th>Actions</th></tr></thead><tbody>
        {rows.map((row) => <tr key={row.id}><td>{row.fullName}</td><td>{row.studentCode}</td><td>{row.email || '—'}</td><td>{row.className}</td><td>{row.classArm || '—'}</td>
          <td>{row.academicSession || '—'}</td><td>{new Date(row.createdAt).toLocaleDateString()}</td><td>
            <button onClick={() => decide(row, 'approve')}>Approve</button>{' '}<button className="sec" onClick={() => decide(row, 'reject')}>Reject</button>
          </td></tr>)}
      </tbody></table></div>}
  </main>
}

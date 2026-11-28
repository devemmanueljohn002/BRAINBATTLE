'use client'

import { useEffect, useState } from 'react'
import BrandLoader from '@/components/branding/BrandLoader'

export default function PendingRegistrations() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/registrations')
    setRows(res.ok ? await res.json() : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function decide(row: any, action: 'approve' | 'reject') {
    if (action === 'reject' && !confirm(`Reject ${row.fullName}'s registration?`)) return
    const res = await fetch(`/api/admin/registrations/${row.id}/${action}`, { method: 'POST' })
    if (!res.ok) setMessage((await res.json()).error || `Unable to ${action} registration`)
    else setMessage(`Registration ${action === 'approve' ? 'approved' : 'rejected'}`)
    load()
  }

  return <main className="portal-main"><h1>Pending Registrations</h1>
    {message && <p role="status">{message}</p>}
    {loading ? <BrandLoader message="Loading registrations…" /> : rows.length === 0 ? <p className="mut">No registrations are awaiting approval.</p> :
      <table><thead><tr><th>Student</th><th>Student ID</th><th>Class</th><th>Class arm</th><th>Academic session</th><th>Actions</th></tr></thead><tbody>
        {rows.map((row) => <tr key={row.id}><td>{row.fullName}</td><td>{row.studentCode}</td><td>{row.className}</td><td>{row.classArm || '—'}</td><td>{row.academicSession || '—'}</td><td>
          <button onClick={() => decide(row, 'approve')}>Approve</button>{' '}
          <button className="sec" onClick={() => decide(row, 'reject')}>Reject</button>
        </td></tr>)}
      </tbody></table>}
  </main>
}

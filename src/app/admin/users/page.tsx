'use client'

import { useEffect, useState } from 'react'
import BrandLoader from '@/components/branding/BrandLoader'

type UserRow = {
  id: string
  loginId: string
  fullName: string
  email?: string
  role: string
  active: boolean
  accountStatus: string
  createdAt: string
  student?: {
    studentCode: string
    className?: string
    classArm?: string
  }
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [stats, setStats] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [bulkPreview, setBulkPreview] = useState<any>(null)
  const [bulkFile, setBulkFile] = useState<File | null>(null)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ q: query })
    if (role) params.set('role', role)
    if (status) params.set('status', status)
    const [usersRes, statsRes] = await Promise.all([
      fetch(`/api/admin/users?${params}`),
      fetch('/api/admin/users/stats'),
    ])
    if (usersRes.ok) setUsers((await usersRes.json()).rows)
    if (statsRes.ok) setStats(await statsRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') || '')
    const confirmPassword = String(form.get('confirmPassword') || '')
    if (password !== confirmPassword) return setMessage('Passwords do not match')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginId: form.get('loginId'),
        fullName: form.get('fullName'),
        email: form.get('email') || null,
        phone: form.get('phone') || null,
        role: form.get('role'),
        password: password || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) return setMessage(data.error || 'Unable to create account')
    setMessage(data.temporaryPassword
      ? `Account created. Temporary password: ${data.temporaryPassword}`
      : 'Administrator account created')
    ;(event.target as HTMLFormElement).reset()
    load()
  }

  async function setAccountStatus(user: UserRow, nextStatus: 'ACTIVE' | 'SUSPENDED') {
    if (!confirm(`${nextStatus === 'SUSPENDED' ? 'Suspend' : 'Activate'} ${user.fullName}?`)) return
    const res = await fetch(`/api/admin/users/${user.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (!res.ok) setMessage((await res.json()).error || 'Unable to update account')
    else setMessage(`Account ${nextStatus === 'ACTIVE' ? 'activated' : 'suspended'}`)
    load()
  }

  async function resetPassword(user: UserRow) {
    if (!confirm(`Reset password for ${user.fullName}?`)) return
    const res = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: 'POST' })
    const data = await res.json()
    setMessage(res.ok
      ? `Temporary password for ${data.loginId}: ${data.temporaryPassword}`
      : data.error || 'Unable to reset password')
  }

  async function previewBulk() {
    if (!bulkFile) return
    const form = new FormData()
    form.append('file', bulkFile)
    const res = await fetch('/api/admin/users/bulk-import?mode=preview', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) return setMessage(data.error || 'Unable to preview CSV')
    setBulkPreview(data)
  }

  async function confirmBulk() {
    if (!bulkFile) return
    const form = new FormData()
    form.append('file', bulkFile)
    const res = await fetch('/api/admin/users/bulk-import?mode=import', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) return setMessage(data.error || 'Unable to import CSV')
    setMessage(`Imported ${data.successfullyImported} students; ${data.failed} failed`)
    setBulkPreview(null)
    setBulkFile(null)
    load()
  }

  return <main className="portal-main">
    <h1>User Management</h1>
    <nav className="row"><a href="/admin/users"><button className="sec" type="button">All users</button></a><a href="/admin/users/create-admin"><button className="sec" type="button">Create admin</button></a><a href="/admin/users/create-student"><button className="sec" type="button">Create student</button></a><a href="/admin/users/import"><button className="sec" type="button">Bulk import</button></a><a href="/admin/users/pending"><button className="sec" type="button">Pending registrations</button></a></nav>
    {stats && <div className="kpis">
      <div className="kpi"><b>{stats.total}</b><span>Total users</span></div>
      <div className="kpi"><b>{stats.administrators}</b><span>Administrators</span></div>
      <div className="kpi"><b>{stats.students}</b><span>Students</span></div>
      <div className="kpi"><b>{stats.pending}</b><span>Pending</span></div>
      <div className="kpi"><b>{stats.suspended}</b><span>Suspended</span></div>
      <div className="kpi"><b>{stats.active}</b><span>Active accounts</span></div>
    </div>}

    <section className="card" style={{ marginTop: 20 }}>
      <h2>Create administrator</h2>
      <form onSubmit={createAdmin} className="row">
        <input name="fullName" required minLength={2} placeholder="Full name" />
        <input name="loginId" required minLength={2} placeholder="Username" />
        <input name="email" type="email" placeholder="Email (optional)" />
        <input name="phone" placeholder="Phone (optional)" />
        <select name="role" required defaultValue="ADMIN">
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ADMIN">Admin</option>
          <option value="QUIZ_MANAGER">Quiz Manager</option>
          <option value="STUDENT_MANAGER">Student Manager</option>
        </select>
        <input name="password" type="password" minLength={8} placeholder="Password (blank = generate)" />
        <input name="confirmPassword" type="password" minLength={8} placeholder="Confirm password" />
        <button>Create account</button>
      </form>
    </section>

    <section className="card" style={{ marginTop: 20 }}>
      <h2>Bulk student import</h2>
      <div className="row">
        <input type="file" accept=".csv,text/csv" onChange={(event) => setBulkFile(event.target.files?.[0] || null)} />
        <button className="sec" type="button" onClick={previewBulk} disabled={!bulkFile}>Preview CSV</button>
      </div>
      {bulkPreview && <div>
        <p>{bulkPreview.valid} valid · {bulkPreview.invalid} invalid · {bulkPreview.total} total</p>
        {bulkPreview.invalid > 0 && <table><thead><tr><th>Row</th><th>Student ID</th><th>Errors</th></tr></thead><tbody>
          {bulkPreview.rows.filter((row: any) => row.errors?.length).map((row: any) => <tr key={row.row}>
            <td>{row.row}</td><td>{row.studentCode}</td><td>{row.errors.join('; ')}</td>
          </tr>)}
        </tbody></table>}
        <button disabled={bulkPreview.valid === 0} onClick={confirmBulk}>Confirm import</button>
      </div>}
    </section>

    <div className="row" style={{ marginTop: 20 }}>
      <input placeholder="Search name, username, ID or email" value={query} onChange={(event) => setQuery(event.target.value)} />
      <select value={role} onChange={(event) => setRole(event.target.value)}><option value="">All roles</option>
        <option value="SUPER_ADMIN">Super Admin</option><option value="ADMIN">Admin</option>
        <option value="QUIZ_MANAGER">Quiz Manager</option><option value="STUDENT_MANAGER">Student Manager</option>
        <option value="STUDENT">Student</option>
      </select>
      <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>
        <option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="PENDING">Pending</option>
      </select>
      <button className="sec" onClick={load}>Search</button>
    </div>
    {message && <p role="status">{message}</p>}
    {loading ? <BrandLoader message="Loading users…" /> : <table style={{ marginTop: 16 }}><thead><tr>
      <th>Name</th><th>Username</th><th>Student ID</th><th>Role</th><th>Class</th><th>Class arm</th><th>Status</th><th>Created</th><th>Actions</th>
    </tr></thead><tbody>{users.map((user) => <tr key={user.id}>
      <td>{user.fullName}</td><td>{user.loginId}</td><td>{user.student?.studentCode || '—'}</td><td>{user.role}</td><td>{user.student?.className || '—'}</td><td>{user.student?.classArm || '—'}</td><td>{user.accountStatus}</td>
      <td>{new Date(user.createdAt).toLocaleDateString()}</td><td>
        <button className="sec" onClick={() => resetPassword(user)}>Reset password</button>{' '}
        <button className="sec" onClick={() => setAccountStatus(user, user.active ? 'SUSPENDED' : 'ACTIVE')}>
          {user.active ? 'Suspend' : 'Activate'}
        </button>
      </td>
    </tr>)}</tbody></table>}
  </main>
}

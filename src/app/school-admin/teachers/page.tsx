'use client'

import { useEffect, useState } from 'react'

export default function SchoolTeachers() {
  const [rows, setRows] = useState<any[]>([])
  const [message, setMessage] = useState('')
  async function load() {
    const res = await fetch('/api/admin/teachers')
    setRows(res.ok ? await res.json() : [])
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
  return <main className="portal-main"><h1>Teacher Management</h1><form className="card" onSubmit={submit}>
    <div className="row"><input name="fullName" required minLength={2} placeholder="Full name" /><input name="loginId" required minLength={2} placeholder="Username" /><input name="password" type="password" minLength={8} placeholder="Temporary password (blank = generate)" /><button>Create teacher</button></div>
    {message && <p role="status">{message}</p>}
  </form><div style={{ overflowX: 'auto', marginTop: 16 }}><table><thead><tr><th>Name</th><th>Username</th><th>Status</th><th>Classes</th></tr></thead><tbody>
    {rows.map((row) => <tr key={row.id}><td>{row.fullName}</td><td>{row.loginId}</td><td>{row.active ? 'Active' : 'Suspended'}</td><td>{row.classes?.map((item: any) => item.name).join(', ') || '—'}</td></tr>)}
  </tbody></table></div></main>
}

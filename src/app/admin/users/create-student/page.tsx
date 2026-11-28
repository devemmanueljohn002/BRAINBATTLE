'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CreateStudent() {
  const [classes, setClasses] = useState<any[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => { fetch('/api/admin/classes').then((res) => res.ok ? res.json() : []).then(setClasses) }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setMessage('')
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') || '')
    if (password && password !== String(form.get('confirmPassword') || '')) {
      setBusy(false); return setMessage('Passwords do not match')
    }
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.get('fullName'),
        studentCode: form.get('studentCode'),
        username: form.get('username') || null,
        email: form.get('email') || null,
        phone: form.get('phone') || null,
        classId: form.get('classId'),
        classArm: form.get('classArm') || null,
        academicSession: form.get('academicSession') || null,
        gender: form.get('gender') || null,
        password: password || null,
      }),
    })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) return setMessage(data.error || 'Unable to create student')
    setMessage(data.password
      ? `Student created. Temporary password: ${data.password}`
      : 'Student created successfully')
    ;(event.target as HTMLFormElement).reset()
  }

  return <main className="portal-main"><h1>Create Student</h1>
    <form className="card" onSubmit={submit}>
      <h2>Personal information</h2>
      <div className="row"><input name="fullName" required minLength={2} placeholder="Full name" /><input name="email" type="email" placeholder="Email (optional)" /><input name="phone" placeholder="Phone number (optional)" /></div>
      <h2>Academic information</h2>
      <div className="row">
        <input name="studentCode" required minLength={2} placeholder="Student ID / admission number" />
        <input name="username" required minLength={2} placeholder="Username" />
        <select name="classId" required defaultValue=""><option value="" disabled>Class</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <input name="classArm" placeholder="Class arm (A, B, C…)" />
        <input name="academicSession" placeholder="Academic session (2026/2027)" />
        <select name="gender" defaultValue=""><option value="">Gender (optional)</option><option value="M">Male</option><option value="F">Female</option></select>
      </div>
      <h2>Account credentials</h2>
      <div className="row">
        <input name="password" type={showPassword ? 'text' : 'password'} minLength={8} placeholder="Password (blank = generate)" />
        <input name="confirmPassword" type={showPassword ? 'text' : 'password'} minLength={8} placeholder="Confirm password" />
        <button className="sec" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'} passwords</button>
      </div>
      {message && <p role="status">{message}</p>}
      <div className="row"><button disabled={busy}>{busy ? 'Creating…' : 'Create student'}</button><Link href="/admin/users"><button className="sec" type="button">Cancel</button></Link></div>
    </form>
  </main>
}

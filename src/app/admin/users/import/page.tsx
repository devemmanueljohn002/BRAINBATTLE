'use client'

import { useState } from 'react'

export default function BulkImport() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [message, setMessage] = useState('')

  function downloadTemplate() {
    const csv = 'full_name,student_id,username,email,school,class,class_arm,academic_session,password\n'
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'brainbattle-student-import-template.csv'
    link.click()
  }

  async function previewUpload() {
    if (!file) return
    setBusy(true); setMessage(''); setResult(null)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/users/bulk-import?mode=preview', { method: 'POST', body: form })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) return setMessage(data.error || 'Unable to validate the CSV')
    setPreview(data)
  }

  async function importRows() {
    if (!file) return
    setBusy(true); setMessage('')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/users/bulk-import?mode=import', { method: 'POST', body: form })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) return setMessage(data.error || 'Unable to import the CSV')
    setResult(data)
  }

  function downloadReport() {
    if (!result) return
    const lines = ['studentId,username,status,error',
      ...result.created.map((row: any) => [row.studentId, row.username, 'created', ''].join(',')),
      ...result.failedRows.map((row: any) => [row.studentCode, row.username, 'failed', `"${row.errors.join('; ').replace(/"/g, '""')}"`].join(','))]
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }))
    link.download = 'brainbattle-student-import-report.csv'
    link.click()
  }

  return <main className="portal-main"><h1>Bulk Student Import</h1>
    <section className="card"><h2>1. Download template</h2><button className="sec" onClick={downloadTemplate}>Download CSV template</button></section>
    <section className="card" style={{ marginTop: 16 }}><h2>2. Upload CSV</h2>
      <input type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] || null)} />
      <button type="button" disabled={!file || busy} onClick={previewUpload}>{busy ? 'Validating…' : 'Validate and preview'}</button>
    </section>
    {message && <p className="err" role="alert">{message}</p>}
    {preview && <section className="card" style={{ marginTop: 16 }}><h2>3. Preview</h2>
      <p>{preview.valid} valid · {preview.invalid} invalid · {preview.total} total</p>
      <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Row</th><th>Name</th><th>Student ID</th><th>Username</th><th>Email</th><th>Class</th><th>Arm</th><th>Session</th><th>Status</th></tr></thead><tbody>
        {preview.rows.map((row: any) => <tr key={row.row}>
          <td>{row.row}</td><td>{row.fullName}</td><td>{row.studentCode}</td><td>{row.username}</td><td>{row.email || '—'}</td><td>{row.className}</td><td>{row.classArm || '—'}</td><td>{row.academicSession || '—'}</td>
          <td>{row.errors.length ? row.errors.join('; ') : 'Valid'}</td>
        </tr>)}
      </tbody></table></div>
      <button disabled={busy || preview.valid === 0} onClick={importRows}>{busy ? 'Importing…' : 'Confirm import'}</button>
    </section>}
    {result && <section className="card" style={{ marginTop: 16 }}><h2>4. Import results</h2>
      <p>{result.successfullyImported} created · {result.failed} failed</p>
      {result.created.length > 0 && <button className="sec" onClick={downloadReport}>Download import report</button>}
    </section>}
  </main>
}

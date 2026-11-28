'use client'

import { useEffect, useState } from 'react'

export default function PlatformAudit() {
  const [rows, setRows] = useState<any[]>([])
  useEffect(() => { fetch('/api/platform/audit').then((res) => res.ok ? res.json() : { rows: [] }).then((data) => setRows(data.rows)) }, [])
  return <main className="portal-main"><h1>Platform Audit Logs</h1><div style={{ overflowX: 'auto' }}><table><thead><tr><th>Time</th><th>Action</th><th>Actor</th><th>School</th><th>IP</th><th>Details</th></tr></thead><tbody>
    {rows.map((row) => <tr key={row.id}><td>{new Date(row.createdAt).toLocaleString()}</td><td>{row.action}</td><td>{row.actorId || 'System'}</td><td>{row.schoolId || 'Platform'}</td><td>{row.ip || '—'}</td><td><code>{JSON.stringify(row.detail)}</code></td></tr>)}
  </tbody></table></div></main>
}

'use client'
import { useEffect, useState } from 'react'
export default function SchoolResults() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch('/api/platform/school-dashboard').then((res) => res.ok ? res.json() : null).then(setData) }, [])
  return <main className="portal-main"><h1>School Results</h1>{data ? <section className="card"><b>{data.attempts}</b><p className="mut">Recorded quiz attempts for this school</p></section> : <p className="mut">Loading results…</p>}</main>
}

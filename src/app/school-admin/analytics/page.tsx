'use client'
import { useEffect, useState } from 'react'
export default function SchoolAnalytics() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch('/api/platform/school-dashboard').then((res) => res.ok ? res.json() : null).then(setData) }, [])
  if (!data) return <main className="portal-main"><p className="mut">Loading analytics…</p></main>
  return <main className="portal-main"><h1>School Analytics</h1><div className="kpis"><div className="kpi"><b>{data.students}</b><span>Students</span></div><div className="kpi"><b>{data.attempts}</b><span>Quiz attempts</span></div><div className="kpi"><b>{data.examinations}</b><span>Exams</span></div><div className="kpi"><b>{data.competitions}</b><span>Competitions</span></div></div></main>
}

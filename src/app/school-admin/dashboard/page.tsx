'use client'

import { useEffect, useState } from 'react'
import BrandLoader from '@/components/branding/BrandLoader'

export default function SchoolDashboard() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch('/api/platform/school-dashboard').then((res) => res.ok ? res.json() : null).then(setData) }, [])
  if (!data) return <main className="portal-main"><BrandLoader message="Loading school dashboard…" /></main>
  return <main className="portal-main"><h1>{data.school.name}</h1><p className="mut">School code {data.school.code} · {data.school.accessStatus}</p>
    <div className="kpis">
      <div className="kpi"><b>{data.students}</b><span>Students</span></div><div className="kpi"><b>{data.teachers}</b><span>Teachers</span></div>
      <div className="kpi"><b>{data.classes}</b><span>Classes</span></div><div className="kpi"><b>{data.examinations}</b><span>Examinations</span></div>
      <div className="kpi"><b>{data.questions}</b><span>Questions</span></div><div className="kpi"><b>{data.competitions}</b><span>Competitions</span></div>
      <div className="kpi"><b>{data.attempts}</b><span>Quiz attempts</span></div>
    </div>
  </main>
}

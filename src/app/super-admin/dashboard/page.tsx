'use client'

import { useEffect, useState } from 'react'
import BrandLoader from '@/components/branding/BrandLoader'

export default function PlatformDashboard() {
  const [data, setData] = useState<any>(null)
  useEffect(() => {
    fetch('/api/platform/dashboard').then((res) => res.ok ? res.json() : null).then(setData)
  }, [])
  if (!data) return <main className="portal-main"><BrandLoader message="Loading platform dashboard…" /></main>
  return <main className="portal-main"><h1>BRAINBATTLE Platform</h1><p className="mut">Central SaaS administration across all registered schools.</p>
    <div className="kpis">
      <div className="kpi"><b>{data.schools}</b><span>Total schools</span></div>
      <div className="kpi"><b>{data.pendingSchools}</b><span>Pending school registrations</span></div>
      <div className="kpi"><b>{data.activeSchools}</b><span>Active schools</span></div>
      <div className="kpi"><b>{data.trialSchools}</b><span>Trial schools</span></div>
      <div className="kpi"><b>{data.suspendedSchools}</b><span>Suspended schools</span></div>
      <div className="kpi"><b>{data.expiredSchools}</b><span>Expired schools</span></div>
      <div className="kpi"><b>{data.administrators}</b><span>Administrators</span></div>
      <div className="kpi"><b>{data.teachers}</b><span>Teachers</span></div>
      <div className="kpi"><b>{data.students}</b><span>Students</span></div>
      <div className="kpi"><b>{data.examinations}</b><span>Exams</span></div>
      <div className="kpi"><b>{data.competitions}</b><span>Competitions</span></div>
      <div className="kpi"><b>{data.questions}</b><span>Questions</span></div>
      <div className="kpi"><b>{data.attempts}</b><span>Quiz attempts</span></div>
    </div>
  </main>
}

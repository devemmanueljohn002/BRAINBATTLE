'use client'

import { useEffect, useState } from 'react'

export default function SchoolSettings() {
  const [dashboard, setDashboard] = useState<any>(null)
  useEffect(() => { fetch('/api/platform/school-dashboard').then((res) => res.ok ? res.json() : null).then(setDashboard) }, [])
  if (!dashboard) return <main className="portal-main"><p className="mut">Loading school settings…</p></main>
  return <main className="portal-main"><h1>School Settings</h1><section className="card"><h2>{dashboard.school.name}</h2>
    <p><b>School code:</b> {dashboard.school.code}</p><p><b>Access status:</b> {dashboard.school.accessStatus}</p>
    <p><b>Subscription plan:</b> {dashboard.school.subscriptionPlan}</p><p><b>Student limit:</b> {dashboard.school.studentLimit ?? 'Unlimited'}</p>
  </section></main>
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function SchoolDetail() {
  const params = useParams<{ id: string }>()
  const [school, setSchool] = useState<any>(null)
  useEffect(() => {
    fetch(`/api/platform/schools/${params.id}`).then((res) => res.ok ? res.json() : null).then(setSchool)
  }, [params.id])
  if (!school) return <main className="portal-main"><p className="mut">Loading school…</p></main>
  return <main className="portal-main"><h1>{school.name}</h1><p className="mut">{school.code} · {school.slug}</p>
    <section className="card"><h2>Access</h2><p><b>Status:</b> {school.accessStatus}</p><p><b>Plan:</b> {school.subscriptionPlan}</p><p><b>Student limit:</b> {school.studentLimit ?? 'Unlimited'}</p><p><b>Teacher limit:</b> {school.teacherLimit ?? 'Unlimited'}</p></section>
  </main>
}

import { guard } from '@/lib/auth'
import { backendFetch } from '@/lib/backend'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Page() {
  await guard('STUDENT')
  const response = await backendFetch('/api/v1/student/dashboard')
  if (!response.ok) return <main><h1>BRAINBATTLE Student Dashboard</h1><p className="err">Unable to load your student dashboard.</p></main>
  const data = await response.json()
  const student = data.student
  if (!student) return <main><h1>BRAINBATTLE account setup required</h1><p className="mut">No student profile is linked to this account.</p></main>
  return <main className="portal-main"><h1>Welcome to the Battle Arena, {student.fullName}</h1><p className="mut">{student.class.name} · Student ID {student.studentCode}</p><p className="mut">Your next challenge awaits. Test your knowledge, sharpen your skills, and rise through the rankings.</p>
    <div className="kpis"><div className="kpi"><b>{data.exams.length}</b><span>Available examinations</span></div><div className="kpi"><b>{data.results.length}</b><span>Published results</span></div><div className="kpi"><b>{student.class.name}</b><span>Assigned class</span></div></div>
    <section className="speed-dashboard-cta"><div><p className="eyebrow">BRAINBATTLE · ⚡ FAST. FOCUSED. FEARLESS.</p><h2>60-SECOND BLITZ</h2><p>Race the clock, answer as many questions as you can, and climb your class leaderboard.</p></div><Link href="/student/speed-challenge"><button>VIEW CHALLENGES</button></Link></section>
    <h2 style={{ marginTop: 28 }}>Competition examinations</h2>
    {data.exams.length === 0 ? <p className="mut">No examinations are available for your class.</p> : data.exams.map((exam: any) => <article className="card" key={exam.id}>
      <h3>{exam.title}</h3><p>{exam.round?.name ?? 'Championship round'} · {exam.durationMin} minutes · {exam._count.questions} questions</p>
      <p className="mut">Starts {new Date(exam.startsAt).toLocaleString()} · Ends {new Date(exam.endsAt).toLocaleString()}</p>
      <Link href={`/student/exam/${exam.id}`}><button>ENTER EXAMINATION</button></Link>
    </article>)}
    <h2 style={{ marginTop: 28 }}>Recent results</h2>{data.results.length === 0 ? <p className="mut">Published results will appear here.</p> : data.results.map((result: any) => <div className="card" key={result.id}>{result.exam.title}: <b>{result.score}/{result.total}</b> ({result.total ? Math.round(result.score / result.total * 100) : 0}%)</div>)}
  </main>
}

import { guard } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from '@/LogoutButton'

export default async function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await guard('SCHOOL_ADMIN')
  return <div className="portal-grid"><aside className="side"><div className="portal-brand"><div><b>{user.school?.name || 'School'}</b><span>SCHOOL ADMINISTRATION</span></div></div>
    <Link href="/school-admin/dashboard">Dashboard</Link><Link href="/school-admin/students">Students</Link><Link href="/school-admin/teachers">Teachers</Link>
    <Link href="/school-admin/classes">Classes</Link><Link href="/school-admin/questions">Question Bank</Link><Link href="/school-admin/exams">Exams</Link>
    <Link href="/school-admin/competitions">Competitions</Link><Link href="/school-admin/results">Results</Link><Link href="/school-admin/leaderboard">Leaderboard</Link>
    <Link href="/school-admin/analytics">Analytics</Link><Link href="/school-admin/settings">School Settings</Link><Link href="/school-admin/profile">Profile</Link><LogoutButton />
  </aside><div>{children}</div></div>
}

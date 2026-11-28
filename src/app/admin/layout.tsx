import { guard } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from '@/LogoutButton'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await guard('SUPER_ADMIN', 'ADMIN', 'QUIZ_MANAGER', 'STUDENT_MANAGER')
  const canManageUsers = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'STUDENT_MANAGER'
  const canManageQuiz = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'QUIZ_MANAGER'
  return <div className="portal-grid"><aside className="side"><div className="portal-brand"><BrainBattleLogo width={68} /><div><b>BRAINBATTLE</b><span>ADMIN CONTROL CENTER</span></div></div>
    <Link href="/admin">Overview</Link>
    {canManageUsers && <Link href="/admin/users">User management</Link>}
    {canManageUsers && <Link href="/admin/classes">Classes</Link>}
    {canManageUsers && <Link href="/admin/students">Students</Link>}
    {canManageQuiz && <Link href="/admin/questions">Question bank</Link>}
    {canManageQuiz && <Link href="/admin/examinations">Examinations</Link>}
    {canManageQuiz && <Link href="/admin/competitions">Live competitions</Link>}
    {canManageQuiz && <Link href="/admin/speed-challenges">Speed challenges</Link>}
    <Link href="/leaderboard">Leaderboard</Link><Link href="/admin/profile">Profile</Link>
    <LogoutButton /></aside><div>{children}</div></div>
}

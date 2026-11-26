import { guard } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from '@/LogoutButton'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'
export default async function Layout({ children }: { children: React.ReactNode }) {
  await guard('ADMIN')
  return <div className="portal-grid"><aside className="side"><div className="portal-brand"><BrainBattleLogo width={68} /><div><b>BRAINBATTLE</b><span>ADMIN CONTROL CENTER</span></div></div>
    <Link href="/admin">Overview</Link><Link href="/admin/classes">Classes</Link><Link href="/admin/students">Students</Link>
    <Link href="/admin/questions">Question bank</Link><Link href="/admin/examinations">Examinations</Link><Link href="/admin/competitions">Live competitions</Link><Link href="/admin/speed-challenges">Speed challenges</Link><Link href="/leaderboard">Leaderboard</Link>
    <LogoutButton /></aside><div>{children}</div></div>
}

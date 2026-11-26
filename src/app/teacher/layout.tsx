import { guard } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from '@/LogoutButton'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'
export default async function Layout({ children }: { children: React.ReactNode }) {
  await guard('TEACHER')
  return <div className="portal-grid"><aside className="side"><div className="portal-brand"><BrainBattleLogo width={68} /><div><b>BRAINBATTLE</b><span>EDUCATOR ARENA</span></div></div><Link href="/teacher">Dashboard</Link><Link href="/leaderboard">Rankings</Link><LogoutButton /></aside><div>{children}</div></div>
}

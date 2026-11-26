import { guard } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from '@/LogoutButton'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'
export default async function Layout({ children }: { children: React.ReactNode }) {
  await guard('STUDENT')
  return <div className="portal-grid"><aside className="side"><div className="portal-brand"><BrainBattleLogo width={68} /><div><b>BRAINBATTLE</b><span>STUDENT ARENA</span></div></div><Link href="/student">Dashboard</Link><Link href="/student/speed-challenge">60-Second Blitz</Link><Link href="/student/competitions">Live competitions</Link><Link href="/leaderboard">Rankings</Link><LogoutButton /></aside><div>{children}</div></div>
}

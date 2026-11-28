import { guard } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from '@/LogoutButton'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await guard('SUPER_ADMIN')
  return <div className="portal-grid"><aside className="side">
    <div className="portal-brand"><div><b>BRAINBATTLE</b><span>PLATFORM ADMIN</span></div></div>
    <Link href="/super-admin/dashboard">Dashboard</Link>
    <Link href="/super-admin/registrations">School registrations</Link>
    <Link href="/super-admin/schools">Schools</Link>
    <Link href="/super-admin/school-administrators">School Administrators</Link>
    <Link href="/super-admin/users">All Users</Link>
    <Link href="/super-admin/competitions">Platform Competitions</Link>
    <Link href="/super-admin/analytics">Analytics</Link>
    <Link href="/super-admin/access">Subscription / Access</Link>
    <Link href="/super-admin/audit">Audit Logs</Link>
    <Link href="/super-admin/settings">Platform Settings</Link>
    <LogoutButton />
  </aside><div>{children}</div></div>
}

import Link from 'next/link'
import BrainBattleLogo from './BrainBattleLogo'

const links = [
  { href: '#about', label: 'About' },
  { href: '#rules', label: 'How it works' },
  { href: '#classes', label: 'Classes' },
  { href: '/leaderboard', label: 'Rankings' },
]

export default function BrandHeader() {
  return (
    <header className="brand-header">
      <div className="brand-header-lockup">
        <BrainBattleLogo width={64} priority />
        <div><strong>BRAINBATTLE</strong><span>THINK FAST. PLAY SMART. WIN BIG.</span></div>
      </div>
      <nav className="brand-desktop-nav" aria-label="Main navigation">
        {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        <Link className="brand-nav-cta" href="/login">Sign in</Link>
      </nav>
      <details className="brand-mobile-nav">
        <summary aria-label="Open navigation menu">Menu</summary>
        <nav aria-label="Mobile navigation">
          {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          <Link href="/login">Sign in</Link>
        </nav>
      </details>
    </header>
  )
}

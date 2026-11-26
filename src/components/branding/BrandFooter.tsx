import Link from 'next/link'
import BrainBattleLogo from './BrainBattleLogo'

export default function BrandFooter() {
  return (
    <footer className="brand-footer">
      <div className="brand-footer-main">
        <div className="brand-footer-identity">
          <BrainBattleLogo width={88} />
          <div><strong>BRAINBATTLE</strong><span>THINK FAST. PLAY SMART. WIN BIG.</span></div>
          <p>An academic competition platform where students test their knowledge, take on challenges, and compete to become champions.</p>
        </div>
        <nav aria-label="Explore BRAINBATTLE">
          <strong>Explore</strong>
          <Link href="/">Home</Link>
          <Link href="/#about">About the platform</Link>
          <Link href="/#rules">How it works</Link>
        </nav>
        <nav aria-label="Competition links">
          <strong>Compete</strong>
          <Link href="/leaderboard">Rankings</Link>
          <Link href="/student/speed-challenge">60-Second Blitz</Link>
          <Link href="/student/competitions">Live competitions</Link>
          <Link href="/student">Student dashboard</Link>
        </nav>
      </div>
      <div className="brand-footer-bottom">
        <span>© {new Date().getFullYear()} BRAINBATTLE. All rights reserved.</span>
        <Link href="/">Back to home</Link>
      </div>
    </footer>
  )
}

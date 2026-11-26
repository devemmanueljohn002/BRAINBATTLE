import Link from 'next/link'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'
import BrandHeader from '@/components/branding/BrandHeader'

export default function HomePage() {
  return (
    <div className="shell">
      <BrandHeader />
      <main className="hero">
        <section>
          <div className="eyebrow">THE ACADEMIC COMPETITION ARENA</div>
          <h1>THINK FAST.<br/><span>PLAY SMART. WIN BIG.</span></h1>
          <p>Take on CBT examinations, live competitions, class battles, and timed challenges. Test your knowledge and rise through the rankings.</p>
          <div className="actions"><Link href="/login">ENTER THE ARENA</Link><Link className="sec" href="/leaderboard">VIEW RANKINGS</Link></div>
        </section>
        <div className="brand-hero-art"><BrainBattleLogo href={null} width={360} priority className="brand-logo--hero" /></div>
      </main>
      <div className="stats">
        <div className="stat"><b>—</b><span>REGISTERED STUDENTS</span></div><div className="stat"><b>6+</b><span>PARTICIPATING CLASSES</span></div><div className="stat"><b>2</b><span>COMPETITION SUBJECTS</span></div><div className="stat"><b>4</b><span>CHAMPIONSHIP ROUNDS</span></div>
      </div>
      <section className="section" id="classes"><div className="eyebrow">PARTICIPATING CLASSES</div><h2>Choose your class. Build your legacy.</h2>
        <div className="classgrid">{['JSS1','JSS2','JSS3','SS1','SS2','SS3'].map((c)=><div className="classcard" key={c}><b>{c}</b><div className="mut">{c.startsWith('J')?'Junior category':'Senior category'}</div></div>)}</div>
      </section>
      <section className="section" id="about"><div className="eyebrow">ABOUT BRAINBATTLE</div><h2>Where preparation meets opportunity.</h2>
        <div className="cards"><article className="card"><h3>Mathematics</h3><p>From number sense to advanced reasoning, solve accurate problems against the clock.</p></article><article className="card"><h3>ICT / Data Processing</h3><p>Demonstrate knowledge of computers, data, networks, digital literacy and information technology.</p></article><article className="card"><h3>Four-stage competition</h3><p>Progress through preliminaries, quarter-finals, semi-finals and the grand finale.</p></article></div>
      </section>
      <section className="section" id="rules"><div className="eyebrow">HOW IT WORKS</div><h2>From registration to championship.</h2><div className="steps">{[
        ['01','Registration','Receive a student ID and secure credentials.'],['02','Accreditation','Sign in and confirm your assigned class.'],['03','Preliminary CBT','Complete Mathematics and ICT challenges.'],['04','Qualification','Advance based on published rules.'],['05','Final rounds','Compete in progressively harder stages.'],['06','Champions','Earn rankings, recognition and certificates.']
      ].map(([n,title,text])=><div className="step" key={n}><small>{n}</small><h3>{title}</h3><p className="mut">{text}</p></div>)}</div></section>
    </div>
  )
}

import Link from 'next/link'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'

const accountTypes = [
  {
    icon: '🏫',
    title: 'School Administrator',
    description: 'Register your school and create an administrator account to manage teachers, students, classes, examinations, and competitions.',
    action: 'Register your school',
    href: '/register/school',
  },
  {
    icon: '🎓',
    title: 'Teacher',
    description: 'Join your school community, manage assigned classes, prepare questions, and monitor student performance.',
    action: 'Register as a teacher',
    href: '/register/teacher',
  },
  {
    icon: '📚',
    title: 'Student',
    description: 'Join your school to participate in CBT examinations, quizzes, speed challenges, and academic competitions.',
    action: 'Register as a student',
    href: '/register/student',
  },
]

export default function Register() {
  return <main className="login-page">
    <section className="register-panel">
      <BrainBattleLogo width={112} priority />
      <p className="login-eyebrow">JOIN THE ARENA</p>
      <h1>Create your BRAINBATTLE account</h1>
      <p className="mut">Choose the account type that matches your role. Super Admin accounts are created through a protected administrative process.</p>
      <div className="register-options">
        {accountTypes.map((type) => <article className="register-option" key={type.href}>
          <div className="register-option-icon" aria-hidden="true">{type.icon}</div>
          <h2>{type.title}</h2>
          <p>{type.description}</p>
          <Link className="register-cta" href={type.href}>{type.action} <span aria-hidden="true">→</span></Link>
        </article>)}
      </div>
      <p className="login-register-prompt">Already have an account? <Link href="/login">Sign in</Link></p>
    </section>
  </main>
}

'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'
import BrandLoader from '@/components/branding/BrandLoader'

type Challenge = {
  id: string
  name: string
  description: string
  className: string
  subjectName: string
  topics: Array<{ id: string; name: string }>
  questionPoolSize: number
  questionCount: number
  durationSeconds: number
  correctPoints: number
  negativeMarking: boolean
  incorrectPoints: number
  randomizeQuestions: boolean
  randomizeOptions: boolean
  allowReview: boolean
  leaderboard: Array<{ rank: number; studentName: string; score: number; correct: number }>
  attemptsRemaining: number | null
  bestScore: number | null
}

type Option = { id: string; label: string; text: string }
type Question = { id: string; number: number; text: string; imageUrl: string | null; topic: string | null; options: Option[] }
type ReviewQuestion = Question & { selectedOptionId: string | null; correctOptionId: string | null; isCorrect: boolean | null }
type Attempt = {
  id: string
  attemptNumber: number
  deadlineAt: string
  completed: boolean
  score: number
  correct: number
  incorrect: number
  unanswered: number
  answered: number
  questionTotal: number
  currentQuestion?: Question | null
  review?: ReviewQuestion[] | null
}

export default function SpeedChallengePlayPage({ params }: { params: { id: string } }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(60)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const finishRequested = useRef(false)

  useEffect(() => {
    fetch(`/api/student/speed-challenges/${params.id}`)
      .then(async (response) => {
        const value = await response.json()
        if (!response.ok) throw new Error(value.detail || value.error || 'Challenge is unavailable')
        setChallenge(value)
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load challenge'))
      .finally(() => setLoading(false))
  }, [params.id])

  async function finishWhenExpired(attemptId: string) {
    if (finishRequested.current) return
    finishRequested.current = true
    setSubmitting(true)
    try {
      const response = await fetch(`/api/student/speed-challenge-attempts/${attemptId}/finish`, { method: 'POST' })
      const value = await response.json()
      if (!response.ok) throw new Error(value.detail || value.error || 'Could not complete the challenge')
      setAttempt(value)
    } catch (reason) {
      finishRequested.current = false
      setError(reason instanceof Error ? reason.message : 'Could not complete the challenge')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!attempt || attempt.completed) return
    const updateTime = () => {
      const remaining = Math.max(0, Math.ceil((new Date(attempt.deadlineAt).getTime() - Date.now()) / 1000))
      setRemainingSeconds(remaining)
      if (remaining === 0) void finishWhenExpired(attempt.id)
    }
    updateTime()
    const timer = window.setInterval(updateTime, 200)
    return () => window.clearInterval(timer)
  }, [attempt])

  async function startChallenge() {
    setError('')
    setSubmitting(true)
    finishRequested.current = false
    try {
      const response = await fetch(`/api/student/speed-challenges/${params.id}/start`, { method: 'POST' })
      const value = await response.json()
      if (!response.ok) throw new Error(value.detail || value.error || 'Could not start the challenge')
      setAttempt(value)
      setRemainingSeconds(Math.max(0, Math.ceil((new Date(value.deadlineAt).getTime() - Date.now()) / 1000)))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not start the challenge')
    } finally {
      setSubmitting(false)
    }
  }

  async function submitAnswer(option: Option) {
    if (!attempt?.currentQuestion || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch(`/api/student/speed-challenge-attempts/${attempt.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: attempt.currentQuestion.id, optionId: option.id }),
      })
      const value = await response.json()
      if (!response.ok) throw new Error(value.detail || value.error || 'Could not submit your answer')
      setFeedback(value.correct ? 'Correct!' : 'Next question!')
      setAttempt(value.attempt)
      setRemainingSeconds(Math.max(0, Math.ceil((new Date(value.attempt.deadlineAt).getTime() - Date.now()) / 1000)))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not submit your answer')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <main className="portal-main"><BrandLoader message="Preparing your BRAINBATTLE challenge…" /></main>
  if (!challenge) return <main className="portal-main"><p className="err" role="alert">{error || 'Challenge is unavailable.'}</p><Link href="/student/speed-challenge">← All challenges</Link></main>

  if (attempt?.completed) {
    return (
      <main className="portal-main">
        <p className="eyebrow">BRAINBATTLE · CHALLENGE COMPLETE</p>
        <section className="speed-result-banner">
          <span aria-hidden="true">🏆</span><h1>Challenge complete!</h1><p>{challenge.name}</p>
          <div className="speed-result-stats"><div><b>{attempt.score}</b><span>Final score</span></div><div><b>{attempt.correct}</b><span>Correct</span></div><div><b>{attempt.incorrect}</b><span>Incorrect</span></div><div><b>{attempt.unanswered}</b><span>Unanswered</span></div></div>
          {challenge.bestScore !== null && <p className="mut">Your previous best was {challenge.bestScore}. Your challenge dashboard updates with this result.</p>}
          <div className="row"><Link href="/student/speed-challenge"><button>BACK TO CHALLENGES</button></Link></div>
        </section>
        {attempt.review ? <section className="speed-review"><h2>Answer review</h2>{attempt.review.map((question) => {
          const selected = question.options.find((option) => option.id === question.selectedOptionId)
          const correct = question.options.find((option) => option.id === question.correctOptionId)
          return <article className="card" key={question.id}><p className="eyebrow">QUESTION {question.number} · {question.isCorrect ? 'CORRECT' : question.selectedOptionId ? 'INCORRECT' : 'UNANSWERED'}</p><h3>{question.text}</h3><p>Your answer: {selected ? `${selected.label}. ${selected.text}` : 'No answer submitted'}</p><p>Correct answer: <b>{correct ? `${correct.label}. ${correct.text}` : 'Unavailable'}</b></p></article>
        })}</section> : <p className="mut">Answer review is disabled for this challenge.</p>}
      </main>
    )
  }

  if (attempt) {
    const question = attempt.currentQuestion
    const progress = attempt.questionTotal ? Math.min(100, (attempt.answered / attempt.questionTotal) * 100) : 0
    return (
      <main className="speed-play-shell">
        <header className="speed-play-header"><div className="speed-play-brand"><BrainBattleLogo width={54} priority/><div><p className="eyebrow">BRAINBATTLE · 60-SECOND BLITZ · {challenge.subjectName} · {challenge.className}</p><h1>{challenge.name}</h1></div></div><Link href="/student/speed-challenge" className="mut">Exit</Link></header>
        <section className="speed-play-stats"><div className={`speed-countdown ${remainingSeconds <= 10 ? 'urgent' : ''}`} aria-live="polite"><span>TIME</span><b>{remainingSeconds}</b><small>SECONDS</small></div><div><b>{attempt.score}</b><span>Score</span></div><div><b>{attempt.correct}</b><span>Correct</span></div><div><b>{attempt.incorrect}</b><span>Incorrect</span></div></section>
        <div className="speed-progress"><span style={{ width: `${progress}%` }} /></div>
        {error && <p className="err" role="alert">{error}</p>}
        {question ? (
          <section className="speed-question-card">
            <div className="speed-question-heading"><span>QUESTION {question.number}{attempt.questionTotal > 0 ? ` OF ${attempt.questionTotal}` : ''}</span>{question.topic && <span>{question.topic}</span>}</div>
            {question.imageUrl && <img className="speed-question-image" src={question.imageUrl} alt="Question illustration" />}
            <h2>{question.text}</h2>
            {feedback && <p className="speed-feedback" aria-live="polite">{feedback}</p>}
            <div className="speed-answer-options">{question.options.map((option) => <button key={option.id} className="speed-answer-option" disabled={submitting} onClick={() => void submitAnswer(option)}><span>{option.label}</span>{option.text}</button>)}</div>
            <p className="mut">Select an answer to move straight to the next question.</p>
          </section>
        ) : <section className="speed-question-card"><h2>Finishing your challenge…</h2></section>}
      </main>
    )
  }

  return (
    <main className="portal-main">
      <Link href="/student/speed-challenge" className="mut">← All challenges</Link>
      <section className="speed-preparation">
        <p className="eyebrow">BRAINBATTLE · 60-SECOND BLITZ · READY. SET. GO.</p><span className="speed-prep-icon" aria-hidden="true">⚡</span>
        <h1>{challenge.name}</h1><p className="mut">{challenge.description || 'Answer as many questions as you can before the clock runs out.'}</p>
        <div className="speed-prep-metrics"><div><b>{challenge.durationSeconds}</b><span>Seconds</span></div><div><b>{challenge.questionPoolSize}</b><span>Questions available</span></div><div><b>{challenge.bestScore ?? '—'}</b><span>Personal best</span></div></div>
        <p><b>{challenge.subjectName}</b> · {challenge.className}{challenge.topics.length > 0 ? ` · ${challenge.topics.map((topic) => topic.name).join(', ')}` : ''}</p>
        <div className="speed-rules"><h2>Challenge rules</h2><ol><li>You have exactly {challenge.durationSeconds} seconds.</li><li>Answer as many questions as you can; each answer moves forward immediately.</li><li>Every correct answer earns {challenge.correctPoints} point{challenge.correctPoints === 1 ? '' : 's'}.</li><li>{challenge.negativeMarking ? `A wrong answer deducts ${challenge.incorrectPoints} points.` : 'Wrong answers earn zero points.'}</li><li>The challenge ends automatically when your timer reaches zero.</li></ol></div>
        {error && <p className="err" role="alert">{error}</p>}
        {challenge.questionPoolSize === 0 && <p className="err">This challenge has no available questions yet.</p>}
        {challenge.attemptsRemaining === 0 && <p className="err">You have used all of your attempts.</p>}
        <button disabled={submitting || challenge.questionPoolSize === 0 || challenge.attemptsRemaining === 0} onClick={() => void startChallenge()}>{submitting ? 'GETTING READY…' : 'START CHALLENGE'}</button>
      </section>
      {challenge.leaderboard.length > 0 && <section className="speed-leaderboard speed-prep-leaderboard"><h2>Challenge leaderboard</h2>{challenge.leaderboard.map((entry) => <div className="speed-leader-row" key={entry.rank}><b>#{entry.rank}</b><span>{entry.studentName}<small>{entry.correct} correct</small></span><strong>{entry.score}</strong></div>)}</section>}
    </main>
  )
}

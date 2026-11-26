'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
  bestScore: number | null
  highestCorrect: number
  attemptsUsed: number
  attemptsRemaining: number | null
  recentAttempts: Array<{ id: string; score: number; correct: number; completedAt: string }>
  leaderboard: Array<{ rank: number; studentName: string; className: string; score: number; correct: number }>
}

export default function StudentSpeedChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/speed-challenges')
      .then(async (response) => {
        const value = await response.json()
        if (!response.ok) throw new Error(value.detail || value.error || 'Could not load challenges')
        setChallenges(value.challenges || [])
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load challenges'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="portal-main">
      <p className="eyebrow">BRAINBATTLE · ⚡ INDIVIDUAL CHALLENGE</p>
      <h1>60-Second Blitz</h1>
      <p className="mut">60 seconds. Unlimited questions. Prove your intelligence.</p>
      {error && <p className="err" role="alert">{error}</p>}
      {loading ? <BrandLoader message="Loading BRAINBATTLE challenges…" /> : challenges.length === 0 ? (
        <section className="speed-empty card"><span aria-hidden="true">⚡</span><h2>No battles available yet</h2><p>Your championship journey begins when a challenge opens for your class.</p><Link href="/student">← Back to dashboard</Link></section>
      ) : (
        <div className="speed-challenge-grid">
          {challenges.map((challenge) => (
            <article className="speed-challenge-card" key={challenge.id}>
              <div className="speed-challenge-card-head"><span className="speed-icon" aria-hidden="true">⚡</span><span className="speed-status">CHALLENGE LIVE</span></div>
              <p className="eyebrow">{challenge.className} · {challenge.subjectName}</p>
              <h2>{challenge.name}</h2>
              <p className="mut">{challenge.description || 'Put your knowledge to the test in this fast-paced individual challenge.'}</p>
              <div className="speed-topic-list">{challenge.topics.length ? challenge.topics.map((topic) => <span key={topic.id}>{topic.name}</span>) : <span>All categories</span>}</div>
              <div className="speed-metrics">
                <div><b>{challenge.durationSeconds}s</b><span>On the clock</span></div>
                <div><b>{challenge.questionPoolSize}</b><span>Questions available</span></div>
                <div><b>{challenge.bestScore ?? '—'}</b><span>Personal best</span></div>
                <div><b>{challenge.highestCorrect}</b><span>Most correct</span></div>
              </div>
              <p className="mut speed-attempt-summary">
                {challenge.attemptsUsed} completed attempt{challenge.attemptsUsed === 1 ? '' : 's'}
                {challenge.attemptsRemaining === null ? ' · Unlimited attempts' : challenge.attemptsRemaining > 0 ? ` · ${challenge.attemptsRemaining} remaining` : ''}
              </p>
              {challenge.questionPoolSize === 0 || challenge.attemptsRemaining === 0
                ? <button disabled>PREPARE CHALLENGE</button>
                : <Link href={`/student/speed-challenge/${challenge.id}`}><button>PREPARE CHALLENGE</button></Link>}
              {challenge.recentAttempts.length > 0 && (
                <details className="speed-recent-attempts"><summary>Previous attempts</summary>
                  {challenge.recentAttempts.map((attempt) => <p key={attempt.id}>Score <b>{attempt.score}</b> · {attempt.correct} correct · {new Date(attempt.completedAt).toLocaleString()}</p>)}
                </details>
              )}
              {challenge.leaderboard.length > 0 && (
                <div className="speed-leaderboard"><h3>Challenge leaderboard</h3>{challenge.leaderboard.slice(0, 5).map((entry) => (
                  <div className="speed-leader-row" key={`${challenge.id}-${entry.rank}`}><b>#{entry.rank}</b><span>{entry.studentName}<small>{entry.className} · {entry.correct} correct</small></span><strong>{entry.score}</strong></div>
                ))}</div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

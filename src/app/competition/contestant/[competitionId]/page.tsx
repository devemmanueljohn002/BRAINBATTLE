'use client'

import { useEffect, useState } from 'react'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'

export default function ContestantBuzzer({ params }: { params: { competitionId: string } }) {
  const id = params.competitionId
  const [competition, setCompetition] = useState<any>(null)
  const [message, setMessage] = useState('Waiting for the presenter.')
  const [won, setWon] = useState(false)
  const [question, setQuestion] = useState<any>(null)
  const [choice, setChoice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      const response = await fetch(`/api/competitions/${id}`, { cache: 'no-store' })
      if (response.ok && alive) {
        const data = await response.json()
        setCompetition(data)
        if (data.currentQuestionId) {
          const questionResponse = await fetch(`/api/competitions/${id}/current-question`, { cache: 'no-store' })
          if (questionResponse.ok && alive) setQuestion(await questionResponse.json())
        } else if (alive) {
          setQuestion(null)
        }
      }
    }
    void load()
    const interval = window.setInterval(load, 1000)
    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${scheme}://${window.location.hostname}:8000/ws/competitions/${id}`)
    socket.onmessage = () => void load()
    return () => {
      alive = false
      window.clearInterval(interval)
      socket.close()
    }
  }, [id])

  useEffect(() => {
    setWon(false)
    setChoice('')
  }, [question?.id])

  async function buzz() {
    if (busy) return
    setBusy(true)
    setMessage('Sending buzz...')
    try {
      const response = await fetch(`/api/competitions/${id}/buzzer`, { method: 'POST' })
      const data = await response.json()
      setWon(Boolean(data.accepted))
      setMessage(data.message || 'Buzzer response received')
    } catch {
      setMessage('Could not reach the competition server')
    } finally {
      setBusy(false)
    }
  }

  async function answer() {
    if (!choice || busy) return
    setBusy(true)
    try {
      const response = await fetch(`/api/competitions/${id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: choice }),
      })
      const data = await response.json()
      setMessage(response.ok
        ? `Answer submitted. ${data.correct ? 'Correct' : 'Incorrect'} · ${data.pointsAwarded} points`
        : data.error || data.detail || 'Could not submit answer')
    } catch {
      setMessage('Could not submit the answer')
    } finally {
      setBusy(false)
    }
  }

  const remaining = question?.timerRemainingSeconds ?? 60
  const timerText = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`

  return (
    <main className="contestant-shell">
      <header className="contestant-header">
        <div className="contestant-brand"><BrainBattleLogo width={58} priority/><div><span className="contestant-kicker">BRAINBATTLE · CONTESTANT ARENA</span><h1>{competition?.name || 'Competition'}</h1></div></div>
        <span className={`contestant-status status-${competition?.status?.toLowerCase()}`}>{competition?.status || 'CONNECTING'}</span>
      </header>

      {question ? (
        <section className="contestant-live">
          <div className="contestant-question">
            <span className="contestant-kicker">Live question</span>
            <h2>{question.text}</h2>
            {question.imageUrl && <img src={question.imageUrl} alt="Question illustration" />}
            <div className="contestant-options">
              {question.options?.map((option: any) => (
                <label className={`contestant-option ${choice === option.id ? 'selected' : ''} ${won ? '' : 'answer-locked'}`} key={option.id}>
                  <input type="radio" name="answer" checked={choice === option.id} disabled={!won || busy} onChange={() => setChoice(option.id)} />
                  <b>{option.label}</b><span>{option.text}</span>
                </label>
              ))}
            </div>
            {question.revealedAnswer && <div className="contestant-reveal"><span>Correct answer</span><strong>{question.revealedAnswer.label}. {question.revealedAnswer.text}</strong>{question.revealedAnswer.explanation && <p>{question.revealedAnswer.explanation}</p>}</div>}
          </div>

          <aside className="contestant-buzzer-panel">
            <div className={`contestant-timer ${remaining <= 5 ? 'danger' : remaining <= 15 ? 'warning' : ''}`}>
              <strong>{timerText}</strong><span>{question.timerStatus === 'EXPIRED' ? 'TIME EXPIRED' : question.timerStatus}</span>
            </div>
            <button type="button" className={`buzzer-button ${won ? 'won' : ''}`} onClick={buzz} disabled={!competition || competition.status !== 'LIVE' || competition.buzzerState !== 'ACTIVE' || won || busy}>
              <span>{won ? 'FIRST' : 'BUZZ'}</span>
            </button>
            <h2>{message}</h2>
            {won && <button type="button" className="submit-answer" disabled={!choice || busy} onClick={answer}>{busy ? 'Submitting...' : 'Submit answer'}</button>}
          </aside>
        </section>
      ) : (
        <section className="contestant-waiting"><span className="contestant-kicker">Contestant area</span><h2>Get ready</h2><p>{competition?.status === 'LIVE' ? 'Waiting for the next question.' : 'The championship will begin shortly.'}</p></section>
      )}
    </main>
  )
}

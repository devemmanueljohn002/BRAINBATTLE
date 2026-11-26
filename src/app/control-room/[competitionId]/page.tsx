'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'

export default function ControlRoom({ params }: { params: { competitionId: string } }) {
  const id = params.competitionId
  const [competition, setCompetition] = useState<any>(null)
  const [question, setQuestion] = useState<any>(null)
  const [board, setBoard] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [revealed, setRevealed] = useState<any>(null)
  const [points, setPoints] = useState('10')
  const [reason, setReason] = useState('Presenter adjustment')
  const [contestant, setContestant] = useState('')
  const [roundId, setRoundId] = useState('')
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  async function load() {
    const [competitionResponse, leaderboardResponse] = await Promise.all([
      fetch(`/api/competitions/${id}`, { cache: 'no-store' }),
      fetch(`/api/competitions/${id}/leaderboard`, { cache: 'no-store' }),
    ])
    if (competitionResponse.ok) {
      const data = await competitionResponse.json()
      setCompetition(data)
      setConnected(true)
      setRoundId((current) => current || data.currentRoundId || data.rounds?.[0]?.id || '')
      if (data.currentQuestionId) {
        const questionResponse = await fetch(`/api/competitions/${id}/current-question`, { cache: 'no-store' })
        if (questionResponse.ok) setQuestion(await questionResponse.json())
      } else {
        setQuestion(null)
      }
    } else {
      setConnected(false)
    }
    if (leaderboardResponse.ok) setBoard(await leaderboardResponse.json())
  }

  useEffect(() => {
    void load()
    const interval = window.setInterval(load, 1000)
    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${scheme}://${window.location.hostname}:8000/ws/competitions/${id}`)
    socket.onopen = () => setConnected(true)
    socket.onclose = () => setConnected(false)
    socket.onmessage = () => void load()
    return () => {
      window.clearInterval(interval)
      socket.close()
    }
  }, [id])

  async function act(path: string, body?: any, confirmation?: string) {
    if (loadingAction) return
    if (confirmation && !window.confirm(confirmation)) return
    setLoadingAction(path)
    setMessage('')
    try {
      const response = await fetch(`/api/competitions/${id}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {}),
      })
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || data.detail || 'Action failed')
        return
      }
      if (data.question) setQuestion(data.question)
      if (path.includes('open-next-question') || path.includes('open-previous-question')) setRevealed(null)
      if (data.nextRoundId) setRoundId(data.nextRoundId)
      if (path === 'display/reveal') setRevealed(data)
      if (data.winner) setMessage(`Champion: ${data.winner.name}`)
      else setMessage(data.completed ? 'Championship completed' : 'Action completed')
      await load()
    } catch {
      setMessage('The server could not complete this action')
    } finally {
      setLoadingAction(null)
    }
  }

  const round = competition?.rounds?.find((item: any) => item.id === roundId)
  const roundQuestions = round?.questions || []
  const currentIndex = roundQuestions.findIndex((item: any) => item.id === competition?.currentQuestionId)
  const questionNumber = currentIndex >= 0 ? currentIndex + 1 : competition?.currentQuestionId ? 1 : 0
  const hasPrevious = currentIndex > 0
  const hasNext = roundQuestions.length > 0 && (currentIndex < 0 || currentIndex < roundQuestions.length - 1)
  const remaining = competition?.timerRemainingSeconds ?? 60
  const formattedTimer = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`

  return (
    <main className="command-shell">
      <header className="command-header">
        <div className="command-brand-lockup">
          <BrainBattleLogo width={58} priority />
          <div>
          <span className="command-kicker">Presenter console</span>
          <h1>{competition?.name || 'Live control room'}</h1>
          <div className="command-meta">
            <span className={`connection-dot ${connected ? 'online' : 'offline'}`}>{connected ? 'Synchronized' : 'Reconnecting'}</span>
            <span>{competition?.status || 'Loading'}</span>
            <span>{competition?.buzzerState || 'DISABLED'}</span>
          </div>
          </div>
        </div>
        <Link className="projector-link" href={`/display/${id}`} target="_blank">Open projector display</Link>
      </header>

      {message && <div className="command-message" role="status">{message}</div>}

      <section className="command-grid">
        <aside className="command-sidebar">
          <article className="command-panel competition-panel">
            <div className="command-panel-heading"><span>Competition</span><b>{competition?.status || '—'}</b></div>
            <dl>
              <div><dt>Round</dt><dd>{round?.name || 'No round selected'}</dd></div>
              <div><dt>Question</dt><dd>{questionNumber || '—'} / {roundQuestions.length || '—'}</dd></div>
              <div><dt>Buzzer</dt><dd>{competition?.buzzerState || 'DISABLED'}</dd></div>
              <div><dt>Timer</dt><dd>{competition?.timerStatus || 'STOPPED'}</dd></div>
            </dl>
            <label className="command-select">Active round
              <select value={roundId} onChange={(event) => setRoundId(event.target.value)}>
                <option value="">Select round</option>
                {competition?.rounds?.map((item: any) => <option value={item.id} key={item.id}>{item.orderNo}. {item.name}</option>)}
              </select>
            </label>
          </article>

          <article className="command-panel">
            <div className="command-panel-heading"><span>Competition control</span></div>
            <div className="command-stack">
              <button type="button" className="command-button secondary" disabled={loadingAction !== null} onClick={() => act('prepare')}>Prepare</button>
              <button type="button" className="command-button primary" disabled={loadingAction !== null || competition?.status === 'COMPLETED'} onClick={() => act('start')}>Start / Resume</button>
              <button type="button" className="command-button secondary" disabled={loadingAction !== null || competition?.status !== 'LIVE'} onClick={() => act('pause')}>Pause competition</button>
              <button type="button" className="command-button danger" disabled={loadingAction !== null || competition?.status === 'COMPLETED'} onClick={() => act('finish', undefined, 'End this competition? This action cannot be undone.')}>End competition</button>
              <button type="button" className="command-button secondary" disabled={loadingAction !== null || !roundId || competition?.status !== 'LIVE'} onClick={() => act(`rounds/${roundId}/advance`)}>Complete round</button>
            </div>
          </article>
        </aside>

        <div className="command-main">
          <article className="command-panel question-command">
            <div className="command-panel-heading">
              <span>Question command</span>
              <b>{questionNumber ? `Question ${questionNumber}` : 'Waiting'}</b>
            </div>

            <div className="question-navigation">
              <button type="button" className="nav-button previous" disabled={loadingAction !== null || !roundId || competition?.status !== 'LIVE' || !hasPrevious} onClick={() => act(`rounds/${roundId}/open-previous-question`)}>
                <span aria-hidden="true">←</span><b>Previous question</b>
              </button>
              <button type="button" className="nav-button next" disabled={loadingAction !== null || !roundId || competition?.status !== 'LIVE' || !hasNext} onClick={() => act(`rounds/${roundId}/open-next-question`)}>
                <b>{loadingAction?.includes('open-next') ? 'Loading...' : 'Next question'}</b><span aria-hidden="true">→</span>
              </button>
            </div>

            {question ? (
              <div className="command-question-preview">
                <div className="command-question-copy">
                  <span className="command-kicker">Current question</span>
                  <h2>{question.text}</h2>
                  {question.imageUrl && <img src={question.imageUrl} alt="Question illustration" />}
                </div>
                <div className="command-options">
                  {question.options?.map((option: any) => (
                    <div className={`command-option ${revealed?.correctOption?.id === option.id ? 'correct' : ''}`} key={option.id}>
                      <b>{option.label}</b><span>{option.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="command-empty"><b>No question on screen</b><span>Select a round and present the next question.</span></div>
            )}

            <button type="button" className="reveal-button" disabled={loadingAction !== null || !question} onClick={() => act('display/reveal')}>
              Reveal correct answer
            </button>
            {revealed?.correctOption && <div className="command-reveal">Correct answer: <b>{revealed.correctOption.label}. {revealed.correctOption.text}</b>{revealed.explanation ? ` — ${revealed.explanation}` : ''}</div>}
          </article>

          <article className="command-panel timer-command">
            <div className="timer-command-copy">
              <span className="command-kicker">Official countdown</span>
              <div className={`command-timer timer-${competition?.timerStatus?.toLowerCase()}`}>{formattedTimer}</div>
              <span className="timer-status-label">{competition?.timerStatus === 'EXPIRED' ? 'TIME EXPIRED' : competition?.timerStatus || 'STOPPED'}</span>
            </div>
            <div className="timer-controls">
              <button type="button" className="command-button primary" disabled={loadingAction !== null || !competition?.currentQuestionId || competition?.status !== 'LIVE' || competition?.timerStatus === 'RUNNING'} onClick={() => act('timer/start')}>Start timer</button>
              <button type="button" className="command-button secondary" disabled={loadingAction !== null || competition?.timerStatus !== 'RUNNING'} onClick={() => act('timer/pause')}>Pause timer</button>
              <button type="button" className="command-button secondary" disabled={loadingAction !== null || competition?.timerStatus !== 'PAUSED'} onClick={() => act('timer/resume')}>Resume timer</button>
              <button type="button" className="command-button secondary" disabled={loadingAction !== null} onClick={() => act('timer/stop')}>Stop timer</button>
              <button type="button" className="command-button secondary" disabled={loadingAction !== null} onClick={() => act('timer/reset')}>Reset timer</button>
            </div>
          </article>
        </div>

        <aside className="command-side">
          <article className="command-panel score-panel">
            <div className="command-panel-heading"><span>Score adjustment</span></div>
            <label>Contestant<select value={contestant} onChange={(event) => setContestant(event.target.value)}><option value="">Select contestant</option>{competition?.contestants?.map((item: any) => <option key={item.id} value={item.id}>{item.contestantNo} — {item.name}</option>)}</select></label>
            <div className="score-fields"><input aria-label="Points" type="number" value={points} onChange={(event) => setPoints(event.target.value)} /><input aria-label="Adjustment reason" value={reason} onChange={(event) => setReason(event.target.value)} /></div>
            <button type="button" className="command-button secondary" disabled={loadingAction !== null || !contestant} onClick={() => act('scores/adjust', { contestantId: contestant, points: Number(points), reason })}>Apply score change</button>
          </article>

          <article className="command-panel leaderboard-panel">
            <div className="command-panel-heading"><span>Live leaderboard</span><b>{board.length}</b></div>
            <div className="command-leaderboard">
              {board.map((row: any) => (
                <div className="command-standing" key={row.contestantNo}><b>{row.position}</b><div><strong>{row.name}</strong><span>{row.className}</span></div><em>{row.score}</em></div>
              ))}
              {board.length === 0 && <p className="standings-empty">No scores yet</p>}
            </div>
          </article>
        </aside>
      </section>
    </main>
  )
}

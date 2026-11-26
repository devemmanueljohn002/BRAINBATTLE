'use client'

import { useEffect, useRef, useState } from 'react'
import BrainBattleLogo from '@/components/branding/BrainBattleLogo'

export default function AudienceDisplay({ params }: { params: { competitionId: string } }) {
  const id = params.competitionId
  const [competition, setCompetition] = useState<any>(null)
  const [connected, setConnected] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [muted, setMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const firstSyncRef = useRef(true)
  const previousStatusRef = useRef<string | null>(null)
  const previousQuestionRef = useRef<string | number | null>(null)
  const expiredBellRef = useRef<string | null>(null)

  async function enableSound() {
    try {
      const context = audioContextRef.current || new AudioContext()
      audioContextRef.current = context
      await context.resume()
      setSoundEnabled(true)
      setMuted(false)
    } catch {
      setSoundEnabled(false)
    }
  }

  function playBell() {
    if (!soundEnabled || muted || !audioContextRef.current) return
    const context = audioContextRef.current
    const now = context.currentTime
    const gain = context.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6)
    gain.connect(context.destination)

    ;[880, 1320].forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, now)
      oscillator.detune.setValueAtTime(index === 0 ? -8 : 8, now)
      oscillator.connect(gain)
      oscillator.start(now)
      oscillator.stop(now + 1.5)
    })
  }

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const response = await fetch(`/api/competitions/${id}/public-display`, { cache: 'no-store' })
        if (!response.ok) throw new Error('sync')
        const data = await response.json()
        if (!alive) return
        setCompetition(data)
        setConnected(true)

        const questionKey = data.questionNo ? `${data.id}:${data.questionNo}` : null
        if (firstSyncRef.current) {
          firstSyncRef.current = false
          previousStatusRef.current = data.timerStatus
          previousQuestionRef.current = questionKey
          return
        }

        if (questionKey !== previousQuestionRef.current) {
          previousQuestionRef.current = questionKey
          previousStatusRef.current = data.timerStatus
          expiredBellRef.current = null
          return
        }

        const genuineExpiration = data.timerStatus === 'EXPIRED'
          && previousStatusRef.current !== 'EXPIRED'
          && expiredBellRef.current !== questionKey
        if (genuineExpiration && questionKey) {
          expiredBellRef.current = questionKey
          playBell()
        }
        previousStatusRef.current = data.timerStatus
      } catch {
        if (alive) setConnected(false)
      }
    }

    load()
    const timer = window.setInterval(load, 1000)

    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${scheme}://${window.location.hostname}:8000/ws/competitions/${id}`)
    socket.onopen = () => setConnected(true)
    socket.onclose = () => setConnected(false)
    socket.onmessage = () => void load()

    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreen)

    return () => {
      alive = false
      window.clearInterval(timer)
      socket.close()
      document.removeEventListener('fullscreenchange', onFullscreen)
    }
  }, [id, soundEnabled, muted])

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  }

  const liveQuestion = competition?.question
  const leaderboard = competition?.leaderboard || []
  const remaining = competition?.timerRemainingSeconds ?? 60
  const duration = competition?.timerDurationSeconds || 60
  const progress = Math.max(0, Math.min(100, (remaining / duration) * 100))
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timerTone = remaining <= 5 ? 'danger' : remaining <= 15 ? 'warning' : 'normal'

  return (
    <main className="broadcast-shell">
      <header className="broadcast-header">
        <div className="broadcast-brand">
          <BrainBattleLogo width={58} priority />
          <div>
            <span className="broadcast-kicker">BRAINBATTLE · LIVE ARENA</span>
            <h1>{competition?.name || 'Competition Arena'}</h1>
          </div>
        </div>
        <div className="broadcast-meta">
          <span className={`sync-pill ${connected ? 'online' : 'offline'}`}><i />{connected ? 'SYNCED' : 'RECONNECTING'}</span>
          <span className={`status-pill status-${competition?.status?.toLowerCase() || 'draft'}`}>
            {competition?.status === 'LIVE' ? 'LIVE' : competition?.status || 'CONNECTING'}
          </span>
        </div>
      </header>

      <div className="broadcast-tools">
        {!soundEnabled ? (
          <button type="button" className="broadcast-tool" onClick={enableSound} aria-label="Enable timer sound">Enable sound</button>
        ) : (
          <button type="button" className="broadcast-tool" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Unmute timer sound' : 'Mute timer sound'}>
            {muted ? 'Sound muted' : 'Sound on'}
          </button>
        )}
        <button type="button" className="broadcast-tool" onClick={toggleFullscreen}>{isFullscreen ? 'Exit full screen' : 'Full screen'}</button>
      </div>

      {competition?.status === 'COMPLETED' ? (
        <section className="broadcast-complete" aria-live="polite">
          <span className="broadcast-kicker">Official result</span>
          <h2>Competition completed</h2>
          {leaderboard[0] ? (
            <div className="champion-panel">
              <span>Champion</span>
              <strong>{leaderboard[0].name}</strong>
              <p>{leaderboard[0].className} · {leaderboard[0].score} points</p>
            </div>
          ) : <p>Competition complete</p>}
        </section>
      ) : !liveQuestion ? (
        <section className="broadcast-waiting" aria-live="polite">
          <div className="waiting-orbit" aria-hidden="true"><span /></div>
          <span className="broadcast-kicker">{competition?.status === 'READY' ? 'Competition ready' : 'Please stand by'}</span>
          <h2>{competition?.status === 'READY' ? 'Ready for the first question' : 'Get ready!'}</h2>
          <p>{competition?.roundName || 'The competition will begin shortly.'}</p>
        </section>
      ) : (
        <section className="broadcast-stage" key={`${competition.id}:${competition.questionNo}`}>
          <div className="broadcast-question-column">
            <div className="question-heading">
              <span className="question-number">Question {competition.questionNo} <b>of {competition.totalQuestions}</b></span>
              <span className="round-name">{competition.roundName || 'Live round'}</span>
              {competition.timerStatus === 'PAUSED' && <span className="state-label paused">PAUSED</span>}
              {competition.timerStatus === 'EXPIRED' && <span className="state-label expired">TIME UP</span>}
            </div>

            <article className="broadcast-question-card">
              {liveQuestion.imageUrl && <img src={liveQuestion.imageUrl} alt="Question illustration" className="broadcast-question-image" />}
              <h2>{liveQuestion.text}</h2>
            </article>

            <div className="broadcast-options">
              {liveQuestion.options.map((option: any) => {
                const correct = competition.revealedAnswer?.label === option.label
                return (
                  <div key={option.label} className={`broadcast-option ${correct ? 'correct' : ''}`}>
                    <span className="option-label">{option.label}</span>
                    <span className="option-text">{option.text}</span>
                    {correct && <span className="correct-label">CORRECT</span>}
                  </div>
                )
              })}
            </div>

            {competition.revealedAnswer?.text && (
              <div className="answer-reveal" aria-live="polite">
                <span>Correct answer</span>
                <strong>{competition.revealedAnswer.label}. {competition.revealedAnswer.text}</strong>
              </div>
            )}
          </div>

          <aside className="broadcast-side">
            <div className={`broadcast-timer tone-${timerTone} timer-${competition.timerStatus?.toLowerCase()}`}>
              <div className="timer-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}>
                <div className="timer-ring-inner">
                  <span className="timer-value">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                  <span className="timer-status">{competition.timerStatus === 'EXPIRED' ? 'TIME EXPIRED' : competition.timerStatus}</span>
                </div>
              </div>
            </div>

            <div className="standings-panel">
              <div className="standings-heading"><span>Live standings</span><b>{leaderboard.length}</b></div>
              {leaderboard.length === 0 ? <p className="standings-empty">Awaiting contestants</p> : leaderboard.slice(0, 5).map((row: any) => (
                <div className="standing-row" key={row.contestantNo}>
                  <span className="standing-rank">{row.position}</span>
                  <div><strong>{row.name}</strong><small>{row.className}</small></div>
                  <b>{row.score}</b>
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}
    </main>
  )
}

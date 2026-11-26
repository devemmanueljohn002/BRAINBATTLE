'use client'

import { FormEvent, useEffect, useState } from 'react'

type Item = { id: string; name: string }
type Challenge = {
  id: string
  name: string
  description: string
  classId: string
  subjectId: string
  topicIds: string[]
  questionCount: number
  durationSeconds: number
  randomizeQuestions: boolean
  randomizeOptions: boolean
  allowMultipleAttempts: boolean
  maxAttempts: number | null
  correctPoints: number
  negativeMarking: boolean
  incorrectPoints: number
  status: string
  startsAt: string | null
  endsAt: string | null
  leaderboardVisible: boolean
  allowReview: boolean
  questionPoolSize: number
}

type ChallengeForm = Omit<Challenge, 'id' | 'questionPoolSize' | 'startsAt' | 'endsAt' | 'maxAttempts'> & {
  startsAt: string
  endsAt: string
  maxAttempts: string
}

const freshForm = (): ChallengeForm => ({
  name: '',
  description: '',
  classId: '',
  subjectId: '',
  topicIds: [],
  questionCount: 0,
  durationSeconds: 60,
  randomizeQuestions: true,
  randomizeOptions: true,
  allowMultipleAttempts: true,
  maxAttempts: '',
  correctPoints: 1,
  negativeMarking: false,
  incorrectPoints: 0,
  status: 'DRAFT',
  startsAt: '',
  endsAt: '',
  leaderboardVisible: true,
  allowReview: true,
})

function localDateTime(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

export default function SpeedChallengesAdminPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [classes, setClasses] = useState<Item[]>([])
  const [subjects, setSubjects] = useState<Item[]>([])
  const [topics, setTopics] = useState<Array<Item & { subjectId: string }>>([])
  const [form, setForm] = useState<ChallengeForm>(freshForm())
  const [editingId, setEditingId] = useState('')
  const [message, setMessage] = useState('')
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const responses = await Promise.all([
      fetch('/api/admin/speed-challenges'),
      fetch('/api/admin/classes'),
      fetch('/api/admin/subjects'),
      fetch('/api/admin/topics'),
    ])
    const values = await Promise.all(responses.map(async (response) => {
      const value = await response.json()
      if (!response.ok) throw new Error(value.detail || value.error || 'Could not load challenge settings')
      return value
    }))
    setChallenges(values[0])
    setClasses(values[1])
    setSubjects(values[2])
    setTopics(values[3])
  }

  useEffect(() => {
    void load().catch((error: unknown) => setLoadError(error instanceof Error ? error.message : 'Could not load challenge settings'))
  }, [])

  function setField<K extends keyof ChallengeForm>(key: K, value: ChallengeForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function edit(challenge: Challenge) {
    setEditingId(challenge.id)
    setForm({
      name: challenge.name,
      description: challenge.description || '',
      classId: challenge.classId,
      subjectId: challenge.subjectId,
      topicIds: challenge.topicIds || [],
      questionCount: challenge.questionCount,
      durationSeconds: challenge.durationSeconds,
      randomizeQuestions: challenge.randomizeQuestions,
      randomizeOptions: challenge.randomizeOptions,
      allowMultipleAttempts: challenge.allowMultipleAttempts,
      maxAttempts: challenge.maxAttempts == null ? '' : String(challenge.maxAttempts),
      correctPoints: challenge.correctPoints,
      negativeMarking: challenge.negativeMarking,
      incorrectPoints: challenge.incorrectPoints,
      status: challenge.status,
      startsAt: localDateTime(challenge.startsAt),
      endsAt: localDateTime(challenge.endsAt),
      leaderboardVisible: challenge.leaderboardVisible,
      allowReview: challenge.allowReview,
    })
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reset() {
    setEditingId('')
    setForm(freshForm())
    setMessage('')
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const payload = {
      ...form,
      questionCount: Number(form.questionCount),
      durationSeconds: Number(form.durationSeconds),
      correctPoints: Number(form.correctPoints),
      incorrectPoints: Number(form.incorrectPoints),
      maxAttempts: form.maxAttempts ? Number(form.maxAttempts) : null,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      topicIds: form.topicIds,
    }
    try {
      const response = await fetch(editingId ? `/api/admin/speed-challenges/${editingId}` : '/api/admin/speed-challenges', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const value = await response.json()
      if (!response.ok) throw new Error(value.detail || value.error || 'Could not save this challenge')
      setMessage(editingId ? 'Challenge settings updated.' : 'Challenge created.')
      reset()
      await load()
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Could not save this challenge'}`)
    } finally {
      setBusy(false)
    }
  }

  const subjectTopics = topics.filter((topic) => topic.subjectId === form.subjectId)

  return (
    <main className="portal-main">
      <p className="eyebrow">BRAINBATTLE · INDIVIDUAL CHALLENGES</p>
      <h1>60-Second Blitz</h1>
      <p className="mut">Create class- and subject-specific timed challenges using approved questions in the question bank.</p>
      {loadError && <p className="err" role="alert">{loadError}</p>}

      <form className="card speed-admin-form" onSubmit={save}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{editingId ? 'Edit challenge' : 'Create challenge'}</h2>
          {editingId && <button type="button" className="sec" onClick={reset}>Cancel edit</button>}
        </div>
        <label>Challenge name<input required minLength={3} maxLength={180} value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="e.g. Mathematics Lightning Round" /></label>
        <label>Description<textarea value={form.description} maxLength={4000} onChange={(event) => setField('description', event.target.value)} placeholder="Tell students what to expect" /></label>
        <div className="row">
          <label>Class<select required value={form.classId} onChange={(event) => setField('classId', event.target.value)}><option value="">Select class</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Subject<select required value={form.subjectId} onChange={(event) => { setField('subjectId', event.target.value); setField('topicIds', []) }}><option value="">Select subject</option>{subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Challenge status<select value={form.status} onChange={(event) => setField('status', event.target.value)}><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="PAUSED">Paused</option><option value="CLOSED">Closed</option></select></label>
        </div>
        <label>Available categories (optional; leave empty for all categories)<select multiple size={Math.min(5, Math.max(2, subjectTopics.length))} value={form.topicIds} onChange={(event) => setField('topicIds', Array.from(event.target.selectedOptions, (option) => option.value))}>{subjectTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></label>
        <div className="row">
          <label>Duration (seconds)<input required type="number" min="5" max="3600" value={form.durationSeconds} onChange={(event) => setField('durationSeconds', Number(event.target.value))} /></label>
          <label>Question pool limit<input type="number" min="0" max="500" value={form.questionCount} onChange={(event) => setField('questionCount', Number(event.target.value))} /><small className="mut">0 = all eligible questions</small></label>
          <label>Maximum attempts<input type="number" min="1" max="1000" disabled={!form.allowMultipleAttempts} value={form.allowMultipleAttempts ? form.maxAttempts : '1'} placeholder="Unlimited" onChange={(event) => setField('maxAttempts', event.target.value)} /><small className="mut">Leave blank for unlimited attempts</small></label>
        </div>
        <div className="row">
          <label>Correct answer points<input type="number" min="0" max="1000" step="0.25" value={form.correctPoints} onChange={(event) => setField('correctPoints', Number(event.target.value))} /></label>
          <label>Points deducted for wrong answer<input type="number" min="0" max="1000" step="0.25" disabled={!form.negativeMarking} value={form.incorrectPoints} onChange={(event) => setField('incorrectPoints', Number(event.target.value))} /></label>
        </div>
        <div className="row">
          <label>Start date/time (optional)<input type="datetime-local" value={form.startsAt} onChange={(event) => setField('startsAt', event.target.value)} /></label>
          <label>End date/time (optional)<input type="datetime-local" value={form.endsAt} onChange={(event) => setField('endsAt', event.target.value)} /></label>
        </div>
        <div className="speed-settings-grid">
          <label><input type="checkbox" checked={form.randomizeQuestions} onChange={(event) => setField('randomizeQuestions', event.target.checked)} /> Randomize questions</label>
          <label><input type="checkbox" checked={form.randomizeOptions} onChange={(event) => setField('randomizeOptions', event.target.checked)} /> Randomize answer options</label>
          <label><input type="checkbox" checked={form.allowMultipleAttempts} onChange={(event) => { setField('allowMultipleAttempts', event.target.checked); if (!event.target.checked) setField('maxAttempts', '1') }} /> Allow multiple attempts</label>
          <label><input type="checkbox" checked={form.negativeMarking} onChange={(event) => setField('negativeMarking', event.target.checked)} /> Enable negative marking</label>
          <label><input type="checkbox" checked={form.leaderboardVisible} onChange={(event) => setField('leaderboardVisible', event.target.checked)} /> Show leaderboard to students</label>
          <label><input type="checkbox" checked={form.allowReview} onChange={(event) => setField('allowReview', event.target.checked)} /> Allow answer review afterward</label>
        </div>
        <p className="mut">Eligible questions are approved multiple-choice or true/false questions matching this class, subject and selected categories.</p>
        <div className="row"><button disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Create challenge'}</button>{message && <p role="status" className={message.startsWith('Error:') ? 'err' : 'mut'}>{message}</p>}</div>
      </form>

      <h2>Challenge register</h2>
      {challenges.length === 0 ? <p className="mut">No speed challenges have been created yet.</p> : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table><thead><tr><th>Challenge</th><th>Class / Subject</th><th>Duration</th><th>Question pool</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{challenges.map((challenge) => (
              <tr key={challenge.id}>
                <td><b>{challenge.name}</b></td>
                <td>{classes.find((item) => item.id === challenge.classId)?.name || '—'} / {subjects.find((item) => item.id === challenge.subjectId)?.name || '—'}</td>
                <td>{challenge.durationSeconds}s</td>
                <td>{challenge.questionPoolSize}{challenge.questionCount > 0 ? ` / ${challenge.questionCount} max` : ''}</td>
                <td>{challenge.status}</td>
                <td><button type="button" className="sec" onClick={() => edit(challenge)}>Edit</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </main>
  )
}

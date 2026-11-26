# Live Competition Operator Guide

This release extends the existing CBT platform with a first live-competition workflow. The CBT examination engine and its existing routes remain in place.

## Main screens

- `/admin/competitions` — create and list competitions.
- `/admin/competitions/{competitionId}` — add rounds, registered students and approved question-bank questions; prepare the event.
- `/control-room/{competitionId}` — presenter controls, question presentation, answer reveal, manual score adjustments and standings.
- `/competition/contestant/{competitionId}` — contestant buzzer and answer screen (student login required).
- `/display/{competitionId}` — read-only projector display; it exposes only public contestant names, classes, scores and currently presented question content. Correct answers are withheld until the presenter reveals them.

## Competition setup

1. Sign in with an administrator account.
2. Open **Live competitions** and create a competition.
3. Open its setup page.
4. Add at least one round. Set question duration and round scoring values.
5. Add registered students as contestants. Contestant numbers must be unique within a competition.
6. Add approved questions to the selected round. Questions must have four options and exactly one correct answer, following the existing question-bank validation rules.
7. Select **Validate & prepare**. The backend checks for a round and contestants.
8. Open the control room, start the competition, select the round and present the next question.
9. Contestants sign in on their own devices and open the contestant route.
10. The first valid buzzer request atomically locks the buzzer. Only that contestant can submit an answer. The backend grades the answer and writes a score event.
11. Reveal the answer when ready. The audience screen then displays the correct answer.
12. End the competition to freeze the event and show the final winner and standings.

## Important integrity rules

- The server, not the browser, decides buzzer eligibility and receives the official timestamp.
- A conditional database update elects one buzzer winner. A second simultaneous request cannot also win.
- The server deadline is authoritative. Browser countdowns are presentation-only.
- Correct answer flags are not returned by contestant or public-display question endpoints.
- Score changes are written to `ScoreEvent`; manual adjustments are administrator-only and audited.
- WebSocket connections require a valid session. The browser clients also poll as a recovery fallback.
- The in-process WebSocket manager is suitable for a single API process. Multi-instance deployments need shared pub/sub (for example Redis) before scaling horizontally.

## Current scope and items to complete before a high-stakes event

The live feature set currently includes competition setup, round/question assignment, contestant registration, prepare/start/pause/finish, next-question presentation, server-timed buzzer, first-buzz lockout, answer submission and grading, score event history, manual adjustments, standings, answer reveal and a public projector view.

The current implementation is a single-question, first-buzzer answer flow. It does not yet implement automatic no-answer scoring when a timer expires, a dedicated answer countdown phase after buzzing, team aggregate scoring, round qualification/advancement automation, tie-breaker automation, certificate PDF generation, XLSX/PDF competition report exports, push notifications or multi-server Redis coordination. These should be treated as outstanding requirements, not as completed features.

## API groups

All endpoints use `/api/v1`:

- `POST /competitions` — create.
- `GET /competitions` and `GET /competitions/{id}` — list and inspect.
- `POST /competitions/{id}/rounds` — add a round.
- `POST /competitions/{id}/contestants` — register a student.
- `POST /competitions/{id}/rounds/{roundId}/questions` — assign a question.
- `POST /competitions/{id}/prepare`, `/start`, `/pause`, `/finish` — lifecycle controls.
- `POST /competitions/{id}/rounds/{roundId}/open-next-question` — present next question and activate buzzer.
- `POST /competitions/{id}/buzzer` — contestant buzzer request.
- `POST /competitions/{id}/answer` — submit the first contestant's answer.
- `POST /competitions/{id}/scores/adjust` — administrator score adjustment.
- `GET /competitions/{id}/leaderboard` — authenticated standings.
- `GET /competitions/{id}/current-question` — contestant-safe active question.
- `GET /competitions/{id}/public-display` — read-only projector data.
- `POST /competitions/{id}/display/reveal` — reveal correct answer (administrator).
- WebSocket: `/ws/competitions/{id}`.

## Database

The new SQLAlchemy tables are `LiveCompetition`, `LiveRound`, `LiveContestant`, `LiveQuestion`, `BuzzerEvent`, `LiveAnswer` and `ScoreEvent`. Migration `0003_live_competitions` creates these tables and preserves existing CBT records. Back up the database before applying migrations to a school production database.

# BRAINBATTLE

Think fast. Play smart. Win big.

A Next.js 14 frontend connected to a Python FastAPI backend and SQLite database.

## Architecture

- Frontend: Next.js 14, React 18, TypeScript and Tailwind CSS.
- Backend: Python 3.13+, FastAPI and SQLAlchemy 2.x.
- Database: SQLite for the initial deployment.
- Migrations: Alembic.
- Authentication: HTTP-only `sid` cookie, SHA-256 hashed session identifiers, seven-day sessions and bcrypt password hashes.

The browser continues to call the existing `/api/...` URLs. Next.js forwards those requests to FastAPI using `FASTAPI_BASE_URL`. Server-rendered pages also query FastAPI and forward the incoming session cookie.

## Requirements

- Node.js 20 or newer.
- Python 3.13 or newer.

## Backend setup (Windows PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env`. Set `DATABASE_URL=sqlite:///./data/championship.db`, `ADMIN_LOGIN`, and a strong `ADMIN_PASSWORD` (at least 12 characters). Keep this file private.
On Windows, run Alembic through the active Python interpreter (`python -m alembic`) rather than the `alembic.exe` launcher. The launcher can retain the path from an earlier checkout if the project or virtual environment was moved.

### Fresh installation (no existing PostgreSQL data to import)

```powershell
python -m alembic upgrade head
python -m app.db.seed
```

### Migrating existing PostgreSQL data

Do **not** run the seed command before importing, because the importer intentionally refuses to merge into a non-empty SQLite database. Follow `docs/DATABASE_MIGRATION.md`: create the schema, run the dry run, verify the old database counts, then run the importer with `--apply`. Run the seed command after import if you need to create any missing initial admin/class/subject records.

Start the backend:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API health: http://127.0.0.1:8000/healthz
Interactive API documentation: http://127.0.0.1:8000/docs

## Frontend setup

Open a second PowerShell terminal at the project root:

```powershell
npm install
```

Set the following in the root `.env` (do not overwrite an existing `.env`; add/update the values):

```dotenv
FASTAPI_BASE_URL=http://127.0.0.1:8000
SESSION_COOKIE_NAME=sid
```

For production, set `NEXT_PUBLIC_SITE_URL` to the canonical public origin so social preview image URLs use the deployed host. Vercel deployments can use the platform-provided `VERCEL_URL`.

### Production API configuration

In Vercel, set `FASTAPI_BASE_URL` to `https://brainbattle-backend-5tno.onrender.com` and keep `SESSION_COOKIE_NAME=sid`. Use the backend origin only: do not append `/docs`, `/api/v1`, or a localhost address. The browser submits login to `/api/auth/login`; the Next.js proxy forwards it as `POST /api/v1/auth/login`.

In Render, set `CORS_ORIGINS` to the comma-separated allowed frontend origins:

```dotenv
CORS_ORIGINS=https://brainbattle-beige.vercel.app,https://brainbattle-chap12.vercel.app,https://brainbattle-git-main-chap12.vercel.app
```

If the Vercel project uses another production or custom domain, add its exact `https://` origin to this list. Redeploy the backend after changing `CORS_ORIGINS`, and redeploy the frontend after changing its environment variables.

Then start Next.js:

```powershell
npm run dev
```

Open http://localhost:3000.

## Running tests

From `backend/` with the virtual environment activated:

```powershell
python -m pytest -q
```

From the project root:

```powershell
npm run typecheck
npm run build
```

## Existing PostgreSQL data

The original Prisma schema and SQL migration are retained as migration references. If the old PostgreSQL database is accessible, set `LEGACY_DATABASE_URL` in `backend/.env` (never commit or share this value). First create the SQLite schema with `python -m alembic upgrade head`, then run a dry run:

```powershell
python scripts/migrate_postgres_to_sqlite.py
```

The dry run prints source row counts only. It does not import data.

Only after checking the source counts and confirming the target SQLite database is empty should you run:

```powershell
python scripts/migrate_postgres_to_sqlite.py --apply
```

The importer preserves existing IDs and relationships and refuses to merge into non-empty target tables. If the old database is unavailable, no old records can be copied; keep a secure database backup and run the importer later when access is restored.

## Security notes

- Passwords are hashed with bcrypt at cost 12. Existing bcrypt password hashes can be verified without resetting user passwords.
- Only a SHA-256 digest of the random session cookie token is stored in SQLite.
- Session cookies are HTTP-only, SameSite=Lax and Secure in production. Keep the frontend and backend `SESSION_COOKIE_NAME` values aligned (`sid` by default).
- Admin and teacher/student routes enforce server-side role checks.
- Student-facing examination responses never include `QuestionOption.isCorrect` or answer explanations.
- Examination scoring is calculated on the server, not trusted from the browser.
- Pausing an examination freezes the schedule and active session deadlines; resuming extends them by the pause duration.
- CSV export neutralizes spreadsheet formula prefixes.
- SQLite is suitable for local development and modest initial workloads. For high-concurrency production competitions, plan a managed PostgreSQL deployment after validating the workload; SQLAlchemy supports that transition.

## Scope note

The supplied repository was a Phase 1 scaffold. This migration restores the student management handlers that were present as misplaced source files, adds endpoints needed by the included UI, and builds the examination/session/leaderboard backend around the schema. The original schema supports option-based answers; typed free-text numeric/expression marking needs an explicit `StudentAnswer` schema extension before it can be safely enabled.

## Live competitions in BRAINBATTLE

The live competition module uses the existing question bank, student accounts and authentication. An administrator creates a competition, assigns rounds and approved questions, registers contestants and controls the event from the control room. The projector display and contestant screens receive authoritative state from FastAPI through polling and WebSockets.

For endpoint details and known deployment requirements, see [docs/LIVE_COMPETITION_GUIDE.md](docs/LIVE_COMPETITION_GUIDE.md).

### Live competition routes

- `/admin/competitions` - create and list live competitions.
- `/admin/competitions/{competitionId}` - configure rounds, contestants and questions.
- `/control-room/{competitionId}` - administrator control room.
- `/display/{competitionId}` - public projector/audience display.
- `/student/competitions` - lists competitions assigned to the signed-in student.
- `/competition/contestant/{competitionId}` - contestant buzzer and answer screen.
- `/admin/questions` - question bank and CSV importer.

### 1. Prepare questions

1. Sign in as an administrator.
2. Open `/admin/questions`.
3. Create questions manually or use **Import Questions (CSV)**.
4. Make sure every question has:
   - an existing class and subject;
   - question text;
   - four options for an MCQ;
   - exactly one correct answer;
   - a valid difficulty and status;
   - `APPROVED` status before assigning it to a competition.

The CSV importer supports preview, row selection, duplicate detection, invalid-row reporting, target class/subject overrides and a downloadable error report. Only approved questions can be added to a live competition round.

A supported header row begins with:

```csv
question_number,class,subject,question_type,question,option_a,option_b,option_c,option_d,correct_answer,difficulty,status,marks
```

### 2. Create and configure the competition

1. Open `/admin/competitions`.
2. Create a competition and enter `/admin/competitions/{competitionId}`.
3. Add at least one round.
4. Add registered students as contestants.
5. Select an approved question and assign it to a round.
6. Repeat until the round contains the required question queue.
7. Click **Validate & prepare**.

Preparation requires at least one round and one contestant. Question assignment is controlled through the competition setup page. Live questions are taken from approved questions in the database, so imported questions immediately become available to the configured competition.

### 3. Start the event

Open these browser views:

- administrator: `/control-room/{competitionId}`;
- projector: `/display/{competitionId}`;
- students: `/student/competitions`, then the assigned contestant screen.
In the control room:

1. Select the competition round.
2. Click **Prepare** if the competition is not already ready.
3. Click **Start / Resume**.
4. Click **Next question**.

Opening a question publishes it immediately to the control room, student, and projector screens. The server opens a fresh 60-second timer and activates the buzzer automatically.

### 4. Control the 60-second timer

The timer is server-authoritative. All screens reconcile with the database and WebSocket state; they do not independently decide when the timer expires.

| Administrator action | Result |
|---|---|
| Next question | Opens the next queued question and starts a fresh 60-second timer. |
| Previous question | Opens the previous queued question with 60 seconds initially paused. |
| Start timer | Starts or restarts the active question timer. |
| Pause timer | Freeze the remaining server time at its current value. |
| Resume timer | Continues from the exact remaining time. |
| Stop timer | Stops the countdown immediately without resetting it. |
| Reset timer | Restores 60 seconds and waits for Start timer. |
| Reveal correct answer | Shows the correct option and explanation to the authorised views. |

Timer states are `RUNNING`, `PAUSED`, `STOPPED`, `RESET`, and `EXPIRED`. At zero, the question remains visible and the timer stays at `00:00`; the administrator must explicitly move to the next question.

### 5. Run contestants and reveal answers

Only registered contestants can access the authenticated buzzer. The first accepted buzzer wins the answer opportunity. Later buzz attempts are rejected while the buzzer is locked.

A contestant can submit an answer only while:

- the competition is live;
- the current question is active;
- the timer window is open;
- the contestant won the buzzer; and
- an answer for that contestant and question has not already been submitted.

The correct answer is excluded from normal current-question responses. It is only returned after the administrator clicks **Reveal correct answer**. The projector and authorised contestant view then display the correct option and optional explanation.

### 6. Pause, resume, finish and recover

Competition pause freezes the competition state. Competition resume restores live state. Ending a competition sets it to `COMPLETED` and displays the completed/champion state on the projector.

When the last queued question is passed:

- the next action marks the competition completed;
- the timer is stopped;
- the buzzer is disabled;
- the display shows the competition-completed/champion state.

If the backend restarts while a timer is running, the saved deadline is retained. Screens receive the remaining server time after reconnecting. Paused timers remain paused, stopped timers remain stopped, and expired timers remain at zero.

### How live synchronisation works

1. FastAPI stores the active round, question, timer deadline, remaining time, timer status and state version in SQLite.
2. The control room, projector and contestant pages periodically reconcile with FastAPI.
3. WebSocket connections receive state-change events and reconnect to the competition room using the signed HTTP-only session cookie.
4. When a client reconnects or joins late, it receives `STATE_SYNC` with the current competition and timer state.
5. Administrator-only actions are sent through authenticated REST endpoints. Students cannot send administrative WebSocket commands.

This setup is suitable for a local hall or modest deployment. For multiple FastAPI workers or a production Internet deployment, use one shared database and a shared WebSocket event broker rather than relying on the in-process WebSocket manager.

### Database upgrade

Back up the database before upgrading. From `backend/` run:

```powershell
python -m alembic upgrade head
```

The live competition migration is `0003_live_competitions`, and the persisted timer state is `0004_live_timer_state`. Both migrations add tables or columns and do not intentionally delete existing CBT data.

### Windows run commands

Backend terminal:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend terminal:

```powershell
cd <project-root>
npm install
npm run dev
```

Open `http://localhost:3000/login`, sign in as the administrator, and open `/admin/competitions`.

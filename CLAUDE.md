# NovaCode — Claude Code Context

## Project Overview
Production-grade full-stack AI-powered web app that fetches LeetCode daily challenges,
analyzes them with AI (Gemini/OpenAI/Claude), and tracks company-wise DSA progress.

## Tech Stack
- **Backend**: Java 21, Spring Boot 3.2.3, Spring Security + JWT, Spring Data JPA, MySQL 8 (dev/prod) + Flyway migrations, H2 (test profile only), Maven
- **Frontend**: Angular 17, Angular Material UI, RxJS, TypeScript
- **AI**: Google Gemini API (primary), OpenAI GPT-4o, Anthropic Claude (fallback chain)
- **External APIs**: LeetCode GraphQL, YouTube Data API v3, GitHub raw CSV
- **Port**: Backend → 8080, Frontend → 4200

## Project Location
```
/home/shivanshupandey/Videos/Self Project /Leetcode/cp-mentor/
├── backend/    ← Spring Boot
└── frontend/   ← Angular 17
```

## How to Run
```bash
# MySQL (Terminal 1) — starts a local MySQL 8 container, data persists in a named volume
cd "/home/shivanshupandey/Videos/Self Project /Leetcode/cp-mentor"
docker-compose up -d          # or `docker compose up -d` depending on your Docker install

# Backend (Terminal 2) — defaults to the `dev` profile (MySQL via docker-compose above)
cd "/home/shivanshupandey/Videos/Self Project /Leetcode/cp-mentor/backend"
mvn spring-boot:run

# Backend with Gemini AI
GEMINI_API_KEY=<your-gemini-key> mvn spring-boot:run

# Frontend (Terminal 3)
cd "/home/shivanshupandey/Videos/Self Project /Leetcode/cp-mentor/frontend"
npx ng serve --proxy-config proxy.conf.json --open

# Kill port 8080 if already in use
sudo kill -9 $(sudo lsof -t -i:8080)

# Stop MySQL (data survives in the docker volume until you `docker-compose down -v`)
docker-compose down
```

Flyway owns the schema (`src/main/resources/db/migration/V*.sql`) and runs automatically on
backend startup against whatever `dev`/`prod` datasource is configured — Hibernate's
`ddl-auto` is `validate` in both profiles, never `create`/`update`. The `test` profile still
uses in-memory H2 with `ddl-auto: create-drop` and Flyway disabled, so unit/integration tests
need no external DB.

## Package Structure (Backend)
```
com.cpmentor/
├── config/
│   ├── SecurityConfig.java          ← Spring Security, JWT, CORS
│   └── AppConfig.java               ← WebClient, OpenAPI beans
├── auth/
│   ├── controller/AuthController.java
│   ├── service/AuthService.java
│   ├── service/CustomUserDetailsService.java
│   ├── entity/User.java
│   ├── repository/UserRepository.java
│   ├── dto/AuthDTOs.java
│   ├── filter/JwtAuthFilter.java
│   └── util/JwtUtil.java
├── problem/
│   ├── controller/ProblemController.java
│   ├── service/ProblemService.java
│   ├── entity/Problem.java
│   ├── repository/ProblemRepository.java
│   └── dto/ProblemDTO.java
├── ai/
│   ├── controller/AIController.java
│   ├── service/AIService.java        ← Gemini + OpenAI + Claude + Mock
│   └── dto/AIAnalysisDTO.java
├── ingestion/
│   ├── entity/DailyChallenge.java
│   ├── repository/DailyChallengeRepository.java
│   ├── service/LeetCodeFetchService.java   ← HttpURLConnection, GraphQL
│   └── scheduler/
│       ├── DailyChallengeScheduler.java
│       └── DailyChallengeController.java
├── youtube/
│   ├── service/YouTubeService.java
│   ├── controller/VideoController.java
│   └── dto/VideoDTO.java
├── company/
│   ├── entity/CompanyProblem.java
│   ├── entity/UserProblemProgress.java
│   ├── repository/CompanyProblemRepository.java
│   ├── repository/UserProblemProgressRepository.java
│   ├── service/CompanyDataLoaderService.java  ← loads from GitHub CSV
│   ├── service/CompanyProblemService.java
│   ├── controller/CompanyProblemController.java
│   └── dto/CompanyProblemDTO.java
├── common/
│   └── DataInitializer.java         ← seeds 3 problems on startup
├── method/                          ← Practice Method module (Phase 1: pattern library)
│   ├── controller/PatternController.java
│   ├── service/PatternService.java
│   ├── service/PatternSeederService.java   ← seeds data/patterns.json + global resources on startup
│   ├── entity/Pattern.java          ← 25 seeded DSA patterns, upserted by slug
│   ├── entity/PatternProblem.java   ← problems per pattern, learning-order via orderIndex
│   ├── entity/Resource.java         ← external learning resources (global or pattern-scoped)
│   ├── repository/PatternRepository.java
│   ├── repository/PatternProblemRepository.java
│   ├── repository/ResourceRepository.java
│   ├── service/ConstraintAnalyzerService.java   ← Phase 2: pure logic, n -> complexity + techniques
│   ├── service/EdgeCaseGeneratorService.java     ← Phase 2: pure logic, type+flags -> checklist
│   ├── service/PatternIdentificationService.java ← Phase 3: keyword match against recognitionTriggers
│   │                                                (NOT AI — see "AI-free by design" gotcha below)
│   ├── service/HintService.java                  ← Phase 3: progressive hints built from Pattern
│   │                                                fields only, + rate limiting (no AI)
│   ├── entity/HintRequestLog.java                ← Phase 3: rate-limit bookkeeping, not exposed via API
│   ├── repository/HintRequestLogRepository.java
│   ├── controller/SolveSessionController.java    ← Phase 4: /api/v1/method/sessions, all JWT-private
│   ├── service/SolveSessionService.java          ← Phase 4: ownership-checked CRUD + duration calc
│   ├── entity/SolveSession.java                  ← Phase 4: the solve worksheet, 5 phases worth of fields
│   ├── repository/SolveSessionRepository.java
│   └── dto/ (PatternSummaryDTO, PatternDetailDTO, PatternProblemDTO, ResourceDTO,
│             ConstraintAnalysisRequest/Response, EdgeCaseRequest/Response,
│             PatternIdentificationRequest/Response, PatternCandidateDTO, HintRequest/Response,
│             SolveSessionCreateRequest, SolveSessionUpdateRequest, SolveSessionCompleteRequest,
│             SolveSessionResponse)
└── exception/
    └── GlobalExceptionHandler.java  ← handles ResponseStatusException too (see gotchas)
```

## REST API Endpoints
```
# Auth (public)
POST /api/v1/auth/register
POST /api/v1/auth/login

# Problems (public GET)
GET  /api/v1/problems/daily
GET  /api/v1/problems/{id}
GET  /api/v1/problems?page=&size=

# AI Analysis (public GET)
GET  /api/v1/ai/analyze/{problemId}

# Videos (public)
GET  /api/v1/videos?topic=

# Daily Challenge
GET  /api/v1/daily-challenge/status
POST /api/v1/daily-challenge/fetch

# Company Tracker (needs JWT fix — see CURRENT BUGS)
GET  /api/v1/company-problems?company=amazon&timeframe=all&page=0&size=50
POST /api/v1/company-problems/{leetcodeId}/tick
GET  /api/v1/company-problems/companies
GET  /api/v1/company-problems/stats
POST /api/v1/company-problems/reload/{company}

# Pattern Library (Practice Method Phase 1 — public GET, JWT for future phases' writes)
GET  /api/v1/method/patterns                 (paginated, ?category=ARRAY|STRING|LINKED_LIST|TREE|GRAPH|DP|GREEDY|MATH|DESIGN)
GET  /api/v1/method/patterns/{slug}
GET  /api/v1/method/patterns/{slug}/problems (ordered by orderIndex — learning order, not random)
GET  /api/v1/method/resources                (?patternSlug= for pattern-scoped, omit for the 8 global ones)
POST /api/v1/method/analyze-constraints       (Phase 2 — {n, sorted, negativesAllowed, duplicatesAllowed, valuesBounded, maxValue} -> target complexity + ordered technique list + overflow warning)
POST /api/v1/method/edge-cases                (Phase 2 — {inputType, ...flags, patternSlug?} -> edge-case checklist, merges in a known pattern's own checklist)
POST /api/v1/method/identify-pattern          (Phase 3, JWT — {problemStatement, constraints?} -> top-3 candidates by keyword match, no AI)
POST /api/v1/method/hint                      (Phase 3, JWT — {problemStatement, problemIdentifier, level 1-4, patternSlug?, confirmLevel4} -> one hint at exactly that level, rate-limited)
POST   /api/v1/method/sessions                (Phase 4, JWT — start a solve session)
PATCH  /api/v1/method/sessions/{id}           (Phase 4, JWT — partial autosave, owner-only)
POST   /api/v1/method/sessions/{id}/complete  (Phase 4, JWT — sets endedAt, computes durationSeconds)
GET    /api/v1/method/sessions[/{id}]         (Phase 4, JWT — list (paginated, ?difficulty=/?solvedUnaided=) or fetch one, owner-only)

# Dev tools
GET  /swagger-ui.html
GET  /h2-console   (test profile only — JDBC: jdbc:h2:mem:cpmentor, user: sa, pass: blank)
```

## Security Rules (SecurityConfig.java)
```java
// Currently PUBLIC:
/api/v1/auth/**
/h2-console/**
/swagger-ui/** and /v3/api-docs/**
GET /api/v1/problems/**
GET /api/v1/videos/**
GET /api/v1/ai/**
/api/v1/daily-challenge/**
GET /api/v1/method/**   // Pattern Library reference data (Phase 1)
POST /api/v1/method/analyze-constraints, /api/v1/method/edge-cases   // Phase 2 — stateless reference logic, no writes
// Phase 3 identify-pattern/hint are deliberately NOT in any permitAll list — they fall through
// to the default `.anyRequest().authenticated()` rule, matching the spec's "(JWT)" requirement.
// Phase 4 sessions/** are private per-user data — this is WHY the GET permitAll rule above was
// narrowed from a "/api/v1/method/**" wildcard to explicit patterns/resources paths only (see
// gotchas) — a wildcard would have made GET /api/v1/method/sessions publicly readable.

// Everything else → requires JWT Bearer token
```

## ✅ Resolved Bugs

- **BUG 1 — Company Tracker showed 0 problems**: `GET /api/v1/company-problems/**` is now
  `permitAll()` in `SecurityConfig.java` (public GET, matching the pattern used for
  `/api/v1/problems/**`, `/api/v1/videos/**`, `/api/v1/ai/**`). Verified against a real MySQL
  dataset via docker-compose:
  ```bash
  curl -s "http://localhost:8080/api/v1/company-problems?company=amazon&timeframe=all&page=0&size=3" | python3 -m json.tool | grep totalElements
  ```
- **H2 in-memory persistence** — replaced with MySQL 8 + Flyway for `dev`/`prod` (see
  *How to Run* above). Verified: register a user, tick a company problem, restart the
  backend — both survive.

## ⚠️ CURRENT BUGS TO FIX

### BUG 2 — Companies dropdown shows old 17 companies from snehasishroy repo
**Root cause**: CompanyDataLoaderService still pointed to snehasishroy repo on first load.
Data is cached in H2 now. Fix: restart backend and trigger manual reload.
```bash
curl -X POST http://localhost:8080/api/v1/company-problems/reload/amazon
```

### BUG 3 — Gemini API key quota exhausted
**Root cause**: Free tier daily quota hit.
**Workaround**: Create new key at https://aistudio.google.com/app/apikey → "Create API key in new project"
**Key format**: Must start with `AIzaSy...` (not `AQ.Ab8...`)
**Set it**: `export GEMINI_API_KEY=AIzaSy_YOUR_KEY` before running mvn

## AI Service — Provider Chain
```java
// AIService.java — priority order
1. Gemini 1.5 Flash   (free, 15 req/min)
2. Gemini 1.5 Flash 8B (free, separate quota)
3. Gemini 2.0 Flash   (free, separate quota)
4. OpenAI GPT-4o-mini  (if OPENAI_API_KEY set)
5. Claude Haiku        (if CLAUDE_API_KEY set)
6. Mock response       (always works, no key needed)
```

## Company Data Source
```
GitHub repo: https://github.com/Shivanshu-23/leetcode-companywise-interview-questions
Raw URL pattern: https://raw.githubusercontent.com/Shivanshu-23/leetcode-companywise-interview-questions/master/{company}/{timeframe}.csv
CSV format: ID,URL,Title,Difficulty,Acceptance %,Frequency %
Timeframes: all.csv, six-months.csv, three-months.csv, thirty-days.csv, more-than-six-months.csv
```

## Frontend Structure (Angular)
```
src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts        ← login, register, JWT localStorage
│   │   ├── problem.service.ts     ← all API calls + interfaces
│   │   ├── pattern.service.ts     ← Pattern Library (Phase 1) + identify-pattern/hint (Phase 3)
│   │   ├── constraint-analyzer.service.ts  ← Phase 2 API calls + interfaces
│   │   └── solve-session.service.ts        ← Phase 4 API calls + interfaces
│   ├── interceptors/
│   │   └── auth.interceptor.ts    ← attaches Bearer token to all requests
│   └── guards/
│       └── auth.guard.ts          ← used by Phase 4's /solve routes (see gotchas)
├── features/
│   ├── home/                      ← daily problem + problem bank
│   ├── analysis/                  ← 5-tab AI analysis page
│   ├── login/
│   ├── register/
│   ├── company-tracker/           ← company-wise DSA tracker with tick marks
│   ├── pattern-library/           ← Phase 1: pattern grid (/patterns) + detail (/patterns/:slug)
│   │   ├── pattern-library.component.ts/html/scss   ← searchable/filterable grid
│   │   └── pattern-detail.component.ts/html/scss    ← 6-tab detail (Intuition/Template/
│   │                                                    Recognition/Mistakes/Problems/Follow-ups)
│   ├── constraint-analyzer/       ← Phase 2: /constraint-analyzer — form + results + printable checklist
│   │   └── constraint-analyzer.component.ts/html/scss
│   └── solve-session/             ← Phase 4: /solve (list+start) + /solve/:id (worksheet), AuthGuard-ed
│       ├── solve-session-list.component.ts/html/scss
│       └── solve-session-worksheet.component.ts/html/scss  ← 5-step stepper, live timer w/
│                                                               difficulty cap, autosave via PATCH,
│                                                               consumes Phase 3's identify-pattern/hint
└── app.module.ts                  ← all declarations + Material imports (NOT lazy-loaded —
                                       every feature here is declared directly in AppModule;
                                       this codebase doesn't use per-feature NgModules)
```

## Key Design Decisions
- **MySQL 8 + Flyway** (`dev`/`prod` profiles): schema is owned entirely by versioned
  migrations in `src/main/resources/db/migration/`; Hibernate `ddl-auto` is `validate`, never
  `create`/`update`. `test` profile keeps H2 in-memory with `ddl-auto: create-drop` and Flyway
  disabled, so tests need no external DB. Local MySQL comes from `docker-compose.yml` at the
  `cp-mentor/` root.
- **Stateless JWT**: no sessions. Token stored in localStorage, sent via interceptor
- **@Lazy AuthenticationManager**: breaks circular dependency (JwtAuthFilter → AuthService → SecurityConfig)
- **@Async company loader**: GitHub CSV fetch doesn't block app startup
- **Strategy Pattern for AI**: swap Gemini/OpenAI/Claude via env var, no code change
- **HttpURLConnection**: used instead of WebClient for LeetCode GraphQL and Gemini — avoids serialization bugs

## Known Patterns / Gotchas
- LeetCode GraphQL has no `constraints` field on QuestionNode — removed from query
- Gemini uses `X-goog-api-key` header (not `?key=` URL param)
- YAML values with special chars (`.`, `_`) need quotes: `api-key: "AQ.Ab8..."` 
- `@Scheduled` cron for midnight IST = `"0 30 18 * * ?"` (UTC timezone)
- `mvn clean spring-boot:run` needed when .class files are stale
- Port conflict: `sudo kill -9 $(sudo lsof -t -i:8080)` before restart
- **Hibernate 6 + MySQL enum gotcha**: `@Enumerated(EnumType.STRING)` fields default to a
  native MySQL `ENUM(...)` column under Hibernate 6's `MySQLDialect`, which then fails
  `ddl-auto: validate` against a plain `VARCHAR` column from a Flyway migration. Fix: annotate
  the field with `@JdbcTypeCode(SqlTypes.VARCHAR)` (see `User.role`, `Problem.difficulty`) so
  it matches the migration's `VARCHAR` column. A global
  `hibernate.type.preferred_enum_jdbc_type: VARCHAR` property is also set in `application.yml`
  as a fallback, but the per-field annotation is what actually fixed it in practice.
- `docker compose` (space) vs `docker-compose` (hyphen) — this environment only has the
  hyphenated standalone binary (`/snap/bin/docker-compose`); use whichever is installed.
- **`GlobalExceptionHandler` was swallowing 404s**: its catch-all `@ExceptionHandler(Exception.class)`
  intercepted `ResponseStatusException` before Spring's own handling could honor its status code,
  so every `ResponseStatusException(HttpStatus.NOT_FOUND, ...)` came back as a 500. Fixed by adding
  a dedicated `@ExceptionHandler(ResponseStatusException.class)` that reads `ex.getStatusCode()`.
  Use `ResponseStatusException` (not a bare `RuntimeException`) for "not found" cases going forward
  — see `PatternService.getPatternDetail()` for the pattern.
- Column sizing for narrative/explanatory text fields: don't assume `VARCHAR(64)` is enough for a
  "complexity" field if the content is a full explanatory sentence rather than bare Big-O notation
  (e.g. `pattern.time_complexity`/`space_complexity` are `VARCHAR(512)`, not `VARCHAR(64)`) —
  MySQL truncation errors surface at insert time, not migration time.
- **Every table needs an explicit primary key, including `@ElementCollection` join tables.**
  Managed MySQL (Aiven, and most others) runs with `sql_require_primary_key=ON` for replication
  safety — a table with only an FK + value column (no PK) fails with MySQL error 3750 at
  migration time. Hit both `problem_topics` (V1) and all six `pattern_*` element-collection
  tables (V2) before an `id BIGINT AUTO_INCREMENT PRIMARY KEY` was added to each. This only
  ever surfaces against a real managed MySQL instance — local docker MySQL and H2 don't enforce
  it, so it won't show up until a real deploy. Any new `@ElementCollection` table in future
  migrations needs the same treatment.
- **Phase 3 (`identify-pattern`/`hint`) is deliberately AI-free** — user decision, not a fallback
  workaround. The original feature spec called for extending `AIService`, but the user wants the
  whole project hostable for free with zero API-cost risk, so `PatternIdentificationService` and
  `HintService` never call any LLM: pattern ID is literal substring matching against
  `Pattern.recognitionTriggers`/`antiTriggers`, and hints are built entirely from `Pattern`'s own
  stored fields (`intuition` for level 2, a regex-based de-Java-ified `javaTemplate` for level 3,
  the verbatim `javaTemplate` for level 4). If AI-backed pattern ID/hints are wanted later, treat
  this as a new decision to revisit with the user, not a silent scope change.
- **Phase 3 acceptance criteria in the original spec doesn't literally hold** — it says pasting
  Trapping Rain Water should return "monotonic-stack and prefix-suffix" as top candidates. There
  is no `prefix-suffix` pattern (Phase 1 seeded `prefix-sum` instead — the spec's own Phase 1
  pattern list never included `prefix-suffix` either, so this looks like a spec inconsistency, not
  something Phase 1 got wrong). More importantly, since matching is now literal-keyword-only (no
  AI), the *classic* Trapping Rain Water phrasing doesn't literally contain any of
  `monotonic-stack`'s or `two-pointer`'s trigger phrases, so it degrades to the frequency-based
  fallback rather than surfacing those patterns — verified live. Keyword matching only works when
  the pasted problem statement happens to contain a stored trigger phrase (e.g. "next greater
  element"). This is an inherent, expected limitation of the AI-free design, not a bug.
- **No frontend for Phase 3 in isolation** — its `identify-pattern`/`hint` endpoints are consumed
  from Phase 4's Solve Session worksheet (step 3 "Hand-Solve & Bottleneck") instead of getting
  their own page, exactly as anticipated.
- **`GET /api/v1/method/**` permitAll was narrowed to explicit paths** (`/patterns`, `/patterns/**`,
  `/resources`) when Phase 4 added private per-user GETs (`/sessions`, `/sessions/{id}`) under the
  same `/api/v1/method` prefix. A wildcard `permitAll` there would have made solve-session data
  world-readable. Any future public method-package endpoint must be added to that explicit list —
  never widen it back to a wildcard while private resources share the prefix.
- **`SolveSession.patternSlug` is not in the original spec's field list** for that entity —
  documented, deliberate addition. Phase 6 needs to know which pattern a session resolved to in
  order to surface `Pattern.interviewFollowUps` on the completion screen; the spec's own field
  list for `TriggerEntry` (Phase 5) has a `patternSlug`, so this mirrors that existing precedent.
- **`AuthGuard` was built but never wired to any route before Phase 4** — `company-tracker` and
  other mixed public/private pages check `auth.isLoggedIn()` inside the component instead of
  guarding the route, since they have a public read path. Phase 4's `/solve` and `/solve/:id`
  are the first entirely-private pages, so they're the first to actually use `canActivate:
  [AuthGuard]`. Follow this precedent for any future fully-private route; keep the inline-check
  pattern for pages with a public read path.

## Environment Variables
```bash
GEMINI_API_KEY=    # Google Gemini (free) — get from aistudio.google.com/app/apikey
OPENAI_API_KEY=    # Optional — GPT-4o-mini fallback
CLAUDE_API_KEY=    # Optional — Claude Haiku fallback
YOUTUBE_API_KEY=   # Optional — real YouTube search (mock works without it)
JWT_SECRET=        # Optional — default is hardcoded 512-bit key (change in prod)

# MySQL — dev profile (defaults match docker-compose.yml, override only if you're not using it)
DB_HOST=            # default: localhost
DB_PORT=             # default: 3306
DB_NAME=              # default: cpmentor
DB_USERNAME=          # default: cpmentor
DB_PASSWORD=          # default: cpmentor

# MySQL — prod profile (Render etc.) — all three required, no defaults
DB_URL=               # full JDBC URL, e.g. jdbc:mysql://<host>:3306/<db>?useSSL=true&serverTimezone=UTC
DB_USERNAME=
DB_PASSWORD=

SPRING_PROFILES_ACTIVE=  # dev (default) | prod | test
```

## What's Working ✅
- JWT Auth (register/login/logout)
- MySQL 8 + Flyway persistence (dev/prod) — accounts and progress survive restarts
- LeetCode daily problem fetch (real problems via GraphQL, midnight scheduler)
- AI Analysis — Gemini/OpenAI/Claude with fallback + mock
- YouTube videos tab (curated mock + real API)
- Company-wise DSA tracker UI (data loads from GitHub, tick marks, public GET — BUG 1 fixed)
- Practice Method Phase 1 — Pattern Library: 25 seeded patterns (`com.cpmentor.method`), each with
  intuition, Java template, recognition/anti-triggers, common mistakes, edge cases, interview
  follow-ups, and 2-4 real LeetCode problems in learning order; searchable grid + 6-tab detail
  page at `/patterns`; 8 global learning resources (Striver sheets, NeetCode, etc.)
- Practice Method Phase 2 — Constraint Analyser (n + flags -> target complexity + ordered
  technique list + overflow warning) and Edge-Case Checklist Generator (input type + flags ->
  checklist, merges in a known pattern's own edge cases); pure logic, zero AI/DB-write cost;
  `/constraint-analyzer` page with printable results
- Practice Method Phase 3 — Pattern identification (keyword match, JWT) and progressive hints
  (JWT, rate-limited: sequential level access, cooldown, explicit level-4 confirmation) — both
  AI-free by deliberate user decision (see gotchas). No standalone page — consumed from Phase 4.
- Practice Method Phase 4 — Solve Session worksheet at `/solve` (list+start) and `/solve/:id`
  (5-step stepper: Constraints -> Restate+BruteForce -> Hand-Solve+Bottleneck (consumes Phase 3's
  identify-pattern/hint) -> Final Approach -> Edge Cases+Code). Constraints step is a write-only
  gate — the pasted problem statement isn't shown back until it's locked in. Live timer with a
  difficulty-based cap (15/35/55 min) and overrun warning. Autosaves via PATCH per step. JWT-only
  via `AuthGuard` (first route in the app to actually use it — see gotchas).
- Angular Material dark theme UI — Home, Analysis (5 tabs), Login, Register, Company Tracker,
  Pattern Library (grid + detail), Constraint Analyzer, Solve Sessions
- Swagger UI at /swagger-ui.html
- `docker-compose.yml` (cp-mentor root) — one-command local MySQL
- **Live on the free stack**: Vercel (frontend) + Render free web service (backend) + Aiven
  free MySQL (persistence). Render free tier spins down after 15 min idle — first request
  after a quiet period is slow (cold start), that's expected.

## What's Pending ❌
- [ ] Practice Method Phases 5-6 — spaced repetition/trigger log, interview follow-up bank,
      company cross-link, PDF export
- [ ] Redis — caching layer (MySQL persistence is done; Redis not started)
- [ ] Docker Compose for the full app (backend + frontend containers — currently MySQL only)
- [ ] Bookmarks + Notes + History
- [ ] GitHub Actions CI/CD

## Next Steps Priority
1. Practice Method Phase 5 — Trigger Log + Spaced Repetition (TriggerEntry entity, recall drill
   page, progress dashboard)
2. Redis setup
3. Docker Compose for backend + frontend

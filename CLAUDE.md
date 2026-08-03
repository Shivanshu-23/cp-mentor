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
│   ├── service/CompanyProblemService.java     ← Phase 6: depends on method.PatternProblemRepository
│   │                                             for the company/pattern cross-link (see gotchas —
│   │                                             the one deliberate cross-feature dependency)
│   ├── controller/CompanyProblemController.java  ← GET now also takes ?patternSlug=
│   └── dto/CompanyProblemDTO.java
├── common/
│   └── DataInitializer.java         ← seeds 3 problems on startup
├── profile/                         ← real LeetCode stats for the Home dashboard
│   ├── controller/LeetCodeProfileController.java  ← GET /api/v1/leetcode-stats, public
│   ├── service/LeetCodeProfileService.java        ← same HttpURLConnection+GraphQL style as
│   │                                                  LeetCodeFetchService; public matchedUser +
│   │                                                  userCalendar + recentAcSubmissionList query,
│   │                                                  no API key needed. Fails soft (zeroed DTO,
│   │                                                  never 500) if LeetCode is unreachable.
│   └── dto/LeetCodeStatsDTO.java
├── method/                          ← Practice Method module — ALL 6 PHASES COMPLETE
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
│   ├── controller/TriggerEntryController.java    ← Phase 5: /api/v1/method/triggers + /stats, JWT-private
│   ├── service/TriggerEntryService.java          ← Phase 5: spaced-repetition scheduling (see gotchas)
│   ├── service/StatsService.java                 ← Phase 5: progress dashboard aggregation
│   ├── entity/TriggerEntry.java                  ← Phase 5: column is `trigger_text` not `trigger`
│   │                                                (TRIGGER is a MySQL reserved word)
│   ├── repository/TriggerEntryRepository.java
│   └── dto/ (PatternSummaryDTO, PatternDetailDTO, PatternProblemDTO, ResourceDTO,
│             ConstraintAnalysisRequest/Response, EdgeCaseRequest/Response,
│             PatternIdentificationRequest/Response, PatternCandidateDTO, HintRequest/Response,
│             SolveSessionCreateRequest, SolveSessionUpdateRequest, SolveSessionCompleteRequest,
│             SolveSessionResponse, TriggerEntryCreateRequest, TriggerEntryResponse,
│             TriggerReviewRequest, StatsResponse)
└── exception/
    └── GlobalExceptionHandler.java  ← handles ResponseStatusException too (see gotchas)
```

## REST API Endpoints
```
# Auth (public)
POST /api/v1/auth/register
POST /api/v1/auth/login   (body now takes optional {..., rememberMe: boolean} — 30-day token
                             instead of the default 24h when true)

# LeetCode profile stats (public GET) — powers the Home "LeetCode Activity" dashboard
GET  /api/v1/leetcode-stats   (username fixed server-side via LEETCODE_USERNAME env var)

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
GET  /api/v1/company-problems?company=amazon&timeframe=all&page=0&size=50&patternSlug=monotonic-stack (patternSlug optional, Phase 6 cross-link)
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
POST /api/v1/method/triggers                  (Phase 5, JWT — log a trigger entry, schedules first review in 2 days)
GET  /api/v1/method/triggers[/due]            (Phase 5, JWT — all entries, or only those due for the recall drill)
POST /api/v1/method/triggers/{id}/review      (Phase 5, JWT — {result: PASS|FAIL|SKIPPED}, owner-only)
GET  /api/v1/method/stats                     (Phase 5, JWT — progress dashboard metrics)

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
GET /api/v1/leetcode-stats
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
│   │   ├── solve-session.service.ts        ← Phase 4 API calls + interfaces
│   │   ├── trigger.service.ts              ← Phase 5 API calls + interfaces (triggers + stats)
│   │   └── leetcode-stats.service.ts       ← GET /api/v1/leetcode-stats, used by Home
│   ├── interceptors/
│   │   └── auth.interceptor.ts    ← attaches Bearer token to all requests
│   └── guards/
│       └── auth.guard.ts          ← used by Phase 4's /solve routes (see gotchas)
├── features/
│   ├── home/                      ← daily problem + problem bank + LeetCode Activity dashboard
│   │                                  (real stats for the configured LEETCODE_USERNAME: total/
│   │                                  today/streak/active-days, difficulty split, 7-day bar chart,
│   │                                  recent submissions — all from leetcode-stats.service.ts)
│   ├── analysis/                  ← 5-tab AI analysis page
│   ├── login/
│   ├── register/
│   ├── company-tracker/           ← company-wise DSA tracker with tick marks + Phase 6 pattern filter
│   ├── pattern-library/           ← Phase 1: pattern grid (/patterns) + detail (/patterns/:slug)
│   │   ├── pattern-library.component.ts/html/scss   ← searchable/filterable grid
│   │   └── pattern-detail.component.ts/html/scss    ← 6-tab detail (Intuition/Template/
│   │                                                    Recognition/Mistakes/Problems/Follow-ups)
│   ├── constraint-analyzer/       ← Phase 2: /constraint-analyzer — form + results + printable checklist
│   │   └── constraint-analyzer.component.ts/html/scss
│   ├── solve-session/             ← Phase 4: /solve (list+start) + /solve/:id (worksheet), AuthGuard-ed
│   │   ├── solve-session-list.component.ts/html/scss
│   │   └── solve-session-worksheet.component.ts/html/scss  ← 5-step stepper, live timer w/
│   │                                                           difficulty cap, autosave via PATCH,
│   │                                                           consumes Phase 3's identify-pattern/hint
│   ├── recall-drill/              ← Phase 5: /recall-drill — due entries, type-then-reveal, self-grade
│   │   └── recall-drill.component.ts/html/scss  ← also accepts ?leetcodeId/&title/&patternSlug
│   │                                                query params from the Solve Session completion screen
│   └── progress-dashboard/        ← Phase 5: /progress — all StatsResponse metrics
│       └── progress-dashboard.component.ts/html/scss
└── app.module.ts                  ← all declarations + Material imports (NOT lazy-loaded —
                                       every feature here is declared directly in AppModule;
                                       this codebase doesn't use per-feature NgModules)
```

**Default route is `/patterns`** (`app-routing.module.ts`, both `''` and `'**'`), not `/home` — Pattern
Library is the landing page; Home (Daily Problem) is still a full page, just no longer the entry
point. Nav bar order in `app.component.html` follows: Pattern Library first, Daily Problem second.

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
- **No magic-word/passwordless login exists or should be added.** User asked for a "type a name
  and auto-login as admin" shortcut; declined as a hardcoded auth-bypass backdoor on a live public
  app with a real DB (anyone who learns the string gets instant admin, no password). Built
  `rememberMe` instead (see below) — same "don't retype my password" convenience, no bypass. If
  this is asked for again, decline again and point back to this entry rather than re-litigating.
- **`rememberMe` login**: `POST /api/v1/auth/login` takes an optional `rememberMe: boolean`
  (`AuthDTOs.LoginRequest`). `false`/omitted → the existing 24h token (`jwt.expiration` in
  `application.yml`). `true` → a 30-day token, via `JwtUtil.generateToken(userDetails, millis)`
  overload and `AuthService.REMEMBER_ME_EXPIRATION_MILLIS`. `AuthResponse.expiresIn` now reflects
  the actual token lifetime in seconds (was hardcoded to 86400 for both login and register).
  Frontend: login form has a "Keep me signed in for 30 days" checkbox, defaulted checked.

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
- **`anyComponentStyle` budget raised to 8kB warn / 12kB error** in `frontend/angular.json` —
  `home.component.scss` crossed the old 8kB hard-error ceiling once the LeetCode Activity dashboard
  styles were added (~10kB total); the production build fails outright (not just warns) past the
  `maximumError` threshold, so this had to move, not just be ignored.
- **`TRIGGER` is a reserved word in MySQL** — `TriggerEntry.trigger` maps to column
  `trigger_text`, not `trigger`. Caught at migration-design time this round (learned the hard
  way with `PRIMARY KEY` requirements in Phase 0/1 — checking reserved words upfront now before
  writing each new migration).
- **`TriggerEntry.lastReviewedAt` is not in the original spec's field list** — documented
  extension. `createdAt` alone can't tell you when the most recent review happened, which the
  "weak patterns: any FAIL in last 14 days" stat needs. Same category of deliberate addition as
  `SolveSession.patternSlug`.
- **Retention rate and "patterns mastered" reflect CURRENT entry state, not full review
  history.** `TriggerEntry` stores only `lastReviewResult` (singular), not a log of every past
  review — so "3+ PASS entries" for a pattern means 3+ *distinct trigger entries* currently
  showing PASS, not 3 cumulative passes on the same entry over time (an entry that went
  PASS→PASS→FAIL only ever counts as its current FAIL state). This matches the spec's literal
  wording ("3+ PASS entries") but is worth knowing if the numbers look lower than expected after
  a lot of back-and-forth reviewing on the same few entries.
- **Recall drill sends the trigger content to the frontend upfront** (`GET /triggers/due` returns
  full entries, not title-only) — the frontend just doesn't render it until "Reveal" is clicked.
  This is a UX-only gate, not a security boundary; fine for a solo self-study tool, would need
  rethinking if this ever became multi-party (e.g. a shared quiz).
- **`company` package now depends on `method` package** (`CompanyProblemService` injects
  `PatternProblemRepository`) — the one deliberate cross-feature dependency in an otherwise
  strict package-by-feature layout, needed for Phase 6's "Amazon problems that use monotonic
  stack" cross-link. One-directional only (company -> method); method must never depend back on
  company. If this pattern needs to repeat elsewhere, consider whether it's still one link or a
  sign the join belongs in its own package instead.
- **Interview follow-ups only exist at the pattern level, not per-problem.** The original spec
  says "per pattern and per problem" — `Pattern.interviewFollowUps` was already seeded in Phase 1
  and is what's surfaced on the Solve Session completion screen via `SolveSession.patternSlug`.
  Adding true per-problem follow-ups would mean a new field on `PatternProblem` and re-authoring
  content for all 76 seeded problems; skipped as low value for the effort versus the existing
  pattern-level coverage. Revisit if per-problem specificity turns out to matter in practice.
- **LeetCode's public GraphQL exposes `userCalendar.submissionCalendar`** — a stringified JSON
  object, `{"<unixDaySeconds>": count, ...}`, keyed by UTC day-start timestamp. This is the only
  way to get a daily activity calendar (not just recent-N submissions) with no auth/API key —
  `LeetCodeProfileService` parses it for the Home dashboard's "last 7 days" bars and "solved
  today". Verified live against `https://leetcode.com/graphql` with a plain `matchedUser` +
  `recentAcSubmissionList` query, same `HttpURLConnection` + `User-Agent`/`Referer` header pattern
  as `LeetCodeFetchService`.
- **Icon-chip stat-card is now the app's shared "shape of a stat"** — introduced in the Company
  Tracker Hallmark redesign (icon in a colour-tinted rounded square, value + label beside it, no
  side-stripe border), reused as-is for the Home LeetCode Activity cards. Reuse this shape for any
  future stat card rather than inventing a new one — consistency across pages was an explicit goal
  of the redesign pass, not accidental repetition.
- **`gradient-text` (the `background-clip: text` headline treatment) is a pre-existing, app-wide
  brand choice**, used on every page's `<h1>` before any Hallmark work started. It technically
  matches Hallmark's "gradient headline" anti-pattern, but it was deliberately left alone during
  both redesign passes (Company Tracker and Home/Pattern Library) — ripping out an established,
  consistently-applied brand element to satisfy a general anti-pattern rule would fragment the
  app's visual identity worse than it fixes, and wasn't in scope. Don't "fix" it unilaterally in a
  future single-page pass; it would need a project-wide decision.
- **Printable exports are `window.print()`, not generated PDFs** — same approach as Phase 2's
  constraint-analyzer checklist, applied to the Solve Session completion screen (full worksheet
  review) and the Progress Dashboard's trigger log. Zero cost, zero new dependencies, consistent
  with the project's free-hosting constraint. Both pages wrap non-printable UI (nav, forms, stat
  cards on the same page as the log) in `.no-print`.

## Environment Variables
```bash
GEMINI_API_KEY=    # Google Gemini (free) — get from aistudio.google.com/app/apikey
OPENAI_API_KEY=    # Optional — GPT-4o-mini fallback
CLAUDE_API_KEY=    # Optional — Claude Haiku fallback
YOUTUBE_API_KEY=   # Optional — real YouTube search (mock works without it)
JWT_SECRET=        # Optional — default is hardcoded 512-bit key (change in prod)
LEETCODE_USERNAME= # Optional — default: shivanshu_23. Whose public LeetCode profile the Home
                    #   dashboard shows (no API key needed, public GraphQL endpoint)

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
- JWT Auth (register/login/logout), optional `rememberMe` for a 30-day token instead of 24h
- Home LeetCode Activity dashboard — real stats (`GET /api/v1/leetcode-stats`, public, no key) for
  the configured `LEETCODE_USERNAME`: total/today/streak/active-days, difficulty split bar,
  last-7-days bar chart, recent submissions list
- Pattern Library is the app's landing route (`/`, `**` → `/patterns`), redesigned as the primary
  entry point: real-count stat strip, category icons, hand-built SVG graph motif in the header,
  focus-visible + staggered-entrance pattern cards, search-clear button
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
- Practice Method Phase 5 — Trigger Log + Spaced Repetition. `POST /triggers` logs a trigger
  (first review in 2 days); `GET /triggers/due` + self-graded PASS/FAIL/SKIPPED review
  (stage 0->1->2->3-retired on PASS, resets to 0 on FAIL, +1 day on SKIPPED) at `/recall-drill`
  — type the approach from memory, then reveal. `GET /stats` -> `/progress` dashboard: problems
  solved by difficulty (gated on trigger reviewStage >= 1 — see gotchas), solve time trend,
  avg submissions, unaided rate, patterns mastered, weak patterns (FAIL in last 14 days),
  triggers due today, retention rate. Solve Session completion screen links into the drill
  pre-filled with leetcodeId/title/patternSlug.
- Practice Method Phase 6 — Interview Follow-Ups & Polish. Completion screen shows the resolved
  pattern's `interviewFollowUps` (pattern-level, not per-problem — see gotchas) plus a full
  printable review of every worksheet field. `GET /api/v1/company-problems` takes an optional
  `?patternSlug=` to cross-link with the pattern library ("Amazon problems that use monotonic
  stack" — verified live, returns exactly the linked problems, empty page for unknown slugs,
  never an error). Company Tracker gained a Pattern filter dropdown. Progress Dashboard gained a
  full, printable Trigger Log. **All 6 Practice Method phases are now complete.**
- Angular Material dark theme UI — Home, Analysis (5 tabs), Login, Register, Company Tracker
  (+ pattern filter), Pattern Library (grid + detail), Constraint Analyzer, Solve Sessions
  (+ printable completion review), Recall Drill, Progress Dashboard (+ printable trigger log)
- Swagger UI at /swagger-ui.html
- `docker-compose.yml` (cp-mentor root) — one-command local MySQL
- **Live on the free stack**: Vercel (frontend) + Render free web service (backend) + Aiven
  free MySQL (persistence). Render free tier spins down after 15 min idle — first request
  after a quiet period is slow (cold start), that's expected.

## What's Pending ❌
- [ ] Redis — caching layer (MySQL persistence is done; Redis not started)
- [ ] Docker Compose for the full app (backend + frontend containers — currently MySQL only)
- [ ] Bookmarks + Notes + History
- [ ] GitHub Actions CI/CD

## Next Steps Priority
1. Redis setup
2. Docker Compose for backend + frontend
3. GitHub Actions CI/CD

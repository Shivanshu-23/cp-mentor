# Drona — Claude Code Context

## Project Overview
Production-grade full-stack AI-powered web app that fetches LeetCode daily challenges,
analyzes them with AI (Gemini/OpenAI/Claude), and tracks company-wise DSA progress.

## Tech Stack
- **Backend**: Java 21, Spring Boot 3.2.3, Spring Security + JWT, Spring Data JPA, MySQL 8 (dev/prod) + Flyway migrations, H2 (test profile only), Maven
- **Frontend**: Angular 17, Angular Material UI, RxJS, TypeScript
- **AI**: Google Gemini API (primary), OpenAI GPT-4o, Anthropic Claude (fallback chain)
- **External APIs**: LeetCode GraphQL, GitHub raw CSV (YouTube Data API integration was removed — v2 Phase G)
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

# LeetCode profile stats — powers the Home "LeetCode Activity" dashboard
GET  /api/v1/leetcode-stats            (public — app-wide LEETCODE_USERNAME default, unchanged v1 shape)
GET  /api/v1/leetcode-stats/me         (JWT — v2 Phase G, the caller's own User.leetcodeUsername, falls back to the default if unset)
GET  /api/v1/leetcode-stats/{username} (public — v2 Phase G, any profile, cached 10min server-side with stale-on-error)

# Problems (public GET)
GET  /api/v1/problems/daily
GET  /api/v1/problems/{id}
GET  /api/v1/problems?page=&size=

# AI Analysis (public GET)
GET  /api/v1/ai/analyze/{problemId}   (response now carries `degraded: boolean` — v2 Phase G;
                                          true means every real provider failed and nothing in
                                          the response is AI-generated, see gotchas)

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

# Method content — v2 Phase E, all public GET, Cache-Control: public max-age=3600
GET  /api/v1/method/phases                    (the 5 solve-worksheet phases)
GET  /api/v1/method/complexity-budget         (n -> target complexity table, same data ConstraintAnalyzerService
                                                  hardcodes for Phase 2 — NOT wired together, see gotchas)
GET  /api/v1/method/moves                     (the 5 optimization moves)
GET  /api/v1/method/rungs                     (the 6-rung stuck ladder)
GET  /api/v1/method/recovery-steps            (the 5-step post-solution recovery protocol)
GET  /api/v1/method/topics                    (the 35-topic priority curriculum)
GET  /api/v1/method/script                    (the 8-step interview talk track)
GET  /api/v1/method/triggers/dictionary?q=    (searchable phrase->pattern dictionary w/ antiTriggers —
                                                  EXACT path, not a /triggers/** wildcard, see gotchas)
GET  /api/v1/method/patterns/{slug}/company-frequency  (v2 Phase E9 — "asked by Amazon N times" for a pattern's problems)

# Visualizers — v2 Phase B/C
GET  /api/v1/visualizers   ← NOT built. Trace generation is entirely client-side (frontend
                               visualizer-catalog.ts); there was never a reason for a backend
                               metadata endpoint given that design, so it was skipped rather
                               than built-and-unused.

# Gamification — v2 Phase F, both JWT, distinct top-level path from /api/v1/method/stats
GET  /api/v1/stats/mastery       (recall streak, pattern mastery tiers, submissions-per-accepted trend)
POST /api/v1/stats/share-card    (rate-limited 10/day — returns image/png bytes)

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
GET /api/v1/ai/**                          // response may be a `degraded: true` state now — see gotchas
/api/v1/daily-challenge/**
GET /api/v1/leetcode-stats, /api/v1/leetcode-stats/**   // /me self-enforces auth in the controller, not here — see gotchas
GET /api/v1/method/patterns, /api/v1/method/patterns/**, /api/v1/method/resources   // Phase 1
POST /api/v1/method/analyze-constraints, /api/v1/method/edge-cases   // Phase 2 — stateless reference logic, no writes
// Phase 3 identify-pattern/hint are deliberately NOT in any permitAll list — they fall through
// to the default `.anyRequest().authenticated()` rule, matching the spec's "(JWT)" requirement.
// Phase 4 sessions/** are private per-user data — this is WHY the GET permitAll rule above was
// narrowed from a "/api/v1/method/**" wildcard to explicit patterns/resources paths only (see
// gotchas) — a wildcard would have made GET /api/v1/method/sessions publicly readable.
GET /api/v1/method/phases, /complexity-budget, /moves, /rungs, /recovery-steps, /topics, /script,
    /triggers/dictionary   // v2 Phase E — static reference content only, exact paths not wildcards

// NOTE: /api/v1/videos/** was removed along with the whole youtube package — v2 Phase G.

// Everything else → requires JWT Bearer token (includes /api/v1/stats/** — v2 Phase F)
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
**Note (v2 Phase G)**: with no working provider, prod/dev now show an honest `degraded: true`
state on the Analysis page instead of the old concept-fallback content — see gotchas. This bug
is exactly the condition that made the removal necessary in the first place.

### BUG 4 — Admin credential rotation prepared but not executed
**Root cause**: v2 Phase G asked for the seeded `admin@novacode.dev` password to be rotated.
Applying it requires the production Aiven MySQL connection string, which wasn't available in
that session (not persisted from the earlier session that created the account).
**The generated password and its BCrypt hash were deliberately NOT committed to this file** —
committing a live credential to git history is a bad practice regardless of repo visibility.
They were shared with the user directly in chat instead.
**To apply**: `UPDATE users SET password_hash = '<hash>' WHERE email = 'admin@novacode.dev';`
against the production Aiven database, using the hash shared out-of-band. Rotate again after
applying — a credential that ever touched a chat transcript shouldn't be treated as long-term-safe.
Update this bug entry to resolved once run.

## AI Service — Provider Chain
```java
// AIService.java — priority order
1. Gemini 1.5 Flash   (free, 15 req/min)
2. Gemini 1.5 Flash 8B (free, separate quota)
3. Gemini 2.0 Flash   (free, separate quota)
4. OpenAI GPT-4o-mini  (if OPENAI_API_KEY set)
5. Claude Haiku        (if CLAUDE_API_KEY set)
6. test profile only: static concept fallback (buildConceptFallback) — curated notes by topic tag
6. prod/dev: degraded state (buildDegradedState) — `degraded: true`, no fabricated content
```
Step 6 split by profile in v2 Phase G — see gotchas for why ("mock" in this list used to mean
the same fallback ran everywhere, including prod, whenever real providers failed).

## Company Data Source
```
GitHub repo: https://github.com/Shivanshu-23/leetcode-companywise-interview-questions
Raw URL pattern: https://raw.githubusercontent.com/Shivanshu-23/leetcode-companywise-interview-questions/master/{company}/{timeframe}.csv
CSV format: ID,URL,Title,Difficulty,Acceptance %,Frequency %
Timeframes: all.csv, six-months.csv, three-months.csv, thirty-days.csv, more-than-six-months.csv
```

## Drona v2 — Experience Layer
A separate, much larger spec ("Drona v2: Experience Layer, DSA Visualizers, and Method
Content") has been implemented on top of the app described elsewhere in this file.
**Phases A, B, C, D, E, F are done. Phase G is done except one blocked item** (admin
credential rotation — prepared but not executed, see gotchas). See gotchas below for exact
scope boundaries on each phase — several deliberately don't match the spec's letter 100%,
documented at the point of the decision rather than left implicit.

- **Phase A — Design System**: `tokens.scss`, a custom Material theme, self-hosted fonts,
  `/styleguide`. The rest of the app was NOT reskinned — see gotchas.
- **Phase B — Visualizer Engine**: `frontend/src/app/features/visualizer/` — Frame/Trace
  model, `<app-viz-player>`, 7 SVG structure renderers, keyboard-driven playback.
- **Phase C — 12 trace generators**: one representative algorithm per category (not every
  sub-variant mentioned in the spec — see gotchas), wired into a catalog + `/visualize/:slug`.
- **Phase D — Command Palette**: `Cmd/Ctrl+K`, fuzzy search, global shortcuts, `?` help.
- **Phase E — Method content**: 9 new reference-data entities (phases, complexity budget,
  optimization moves, stuck rungs, recovery steps, trigger-phrase dictionary, topic priorities,
  interview script, company-frequency join), all seeded and publicly queryable/cached.
- **Phase F — Retention-weighted gamification**: recall streak, pattern mastery tiers,
  submissions-per-accepted trend, a hand-drawn PNG share card (rate-limited 10/day), confetti
  on an all-PASS recall drill.
- **Phase G — Removals**: mock AI fallback replaced with an honest degraded state in
  prod/dev (test profile keeps the richer fallback), YouTube tab deleted entirely (frontend +
  backend), Analysis page collapsed 5→2 tabs, per-user `leetcodeUsername` replacing the
  hardcoded default, problem bank audited (not deleted — see gotchas), admin credential
  rotation prepared but blocked on missing prod DB access this session.

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
│   │   ├── leetcode-stats.service.ts       ← GET /api/v1/leetcode-stats, used by Home
│   │   ├── command-palette.service.ts      ← v2 Phase D: item registry, fuzzy search, recent
│   │   │                                      items (localStorage), all data from EXISTING
│   │   │                                      endpoints (patterns/problems/companies) — no new
│   │   │                                      backend surface for the palette itself
│   │   ├── keyboard-shortcuts.service.ts   ← v2 Phase D: global Cmd/Ctrl+K, g-chords, /, ?, Esc
│   │   ├── method-content.service.ts       ← v2 Phase E: all 8 method-content GETs. No page
│   │   │                                      consumes this yet — see gotchas
│   │   └── mastery.service.ts              ← v2 Phase F: /api/v1/stats/mastery + share-card
│   ├── interceptors/
│   │   └── auth.interceptor.ts    ← attaches Bearer token to all requests
│   └── guards/
│       └── auth.guard.ts          ← used by Phase 4's /solve routes (see gotchas)
├── features/
│   ├── home/                      ← daily problem + problem bank + LeetCode Activity dashboard
│   │                                  (real stats for the configured LEETCODE_USERNAME: total/
│   │                                  today/streak/active-days, difficulty split, 7-day bar chart,
│   │                                  recent submissions — all from leetcode-stats.service.ts)
│   ├── analysis/                  ← 2-tab AI analysis page (Analysis / Discussion — collapsed
│   │                                  from 5 tabs, Videos tab removed — v2 Phase G)
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
│   ├── progress-dashboard/        ← Phase 5: /progress — StatsResponse metrics + v2 Phase F's
│   │                                  mastery-card (recall streak, pattern-mastery tile grid,
│   │                                  submissions-per-accepted trend, "Share stat card" button)
│   └── visualizer/                ← v2 Phase B/C, ALL standalone components (see gotchas for why
│       │                             this is the one feature that deviates from the AppModule
│       │                             convention beyond styleguide)
│       ├── model.ts               ← Frame/Trace/Highlight/Pointer/StructureKind — the engine's core types
│       ├── viz-player.component.ts/html/scss   ← <app-viz-player>: play/pause/step/scrub/speed,
│       │                                           keyboard (Space/←/→/r/0-9), ngSwitch over 7 renderers
│       ├── renderers/             ← one per StructureKind, all pure SVG bound to the current frame
│       │   ├── array-renderer, stack-renderer, linked-list-renderer, tree-renderer,
│       │       trie-renderer, graph-renderer, grid-renderer (.component.ts/html/scss each)
│       ├── traces/                ← one file per algorithm, each a pure (input) -> Trace function
│       │   ├── linear-search.trace.ts   ← Phase B's own trivial acceptance-criteria trace
│       │   └── array, two-pointer-window (2 generators — two-pointer + sliding-window),
│       │       dutch-flag, string, monotonic-stack, prefix-sum, linked-list, tree, trie,
│       │       graph, dp-table, sorting (.trace.ts each) — Phase C, one representative
│       │       algorithm per category, not every sub-variant the spec listed (see gotchas)
│       ├── visualizer-catalog.ts  ← slug -> {title, structure, presets, generate} — imports every
│       │                             trace generator, so this file is intentionally NEVER imported
│       │                             from an eagerly-loaded component (see visualizer-registry.ts)
│       ├── visualizer-registry.ts ← LIGHT metadata-only twin of the catalog (slug/title/patternSlug,
│       │                             no generator functions) — pattern-detail.component imports THIS,
│       │                             not the catalog, to avoid pulling visualizer code into the eager bundle
│       └── visualizer-page.component.ts/html/scss  ← /visualize/:slug, standalone + lazy-loaded
├── shared/
│   ├── tilt.directive.ts
│   └── command-palette/           ← v2 Phase D
│       ├── command-palette.component.ts/html/scss  ← Cmd/Ctrl+K, built on the new tokens
│       ├── help-overlay.component.ts/html/scss     ← "?" shortcuts overlay
│       └── fuzzy-match.ts         ← dependency-free subsequence fuzzy matcher
├── dev/
│   └── styleguide/                ← v2 Phase A, dev-only (see gotchas — isDevMode() gated)
│       └── styleguide.component.ts/html/scss  ← standalone, lazy-loaded, /styleguide
└── app.module.ts                  ← all declarations + Material imports (NOT lazy-loaded —
                                       every feature here is declared directly in AppModule;
                                       this codebase doesn't use per-feature NgModules — styleguide
                                       and the entire visualizer/ feature are the deliberate
                                       exceptions, both standalone + lazy so their code isn't in
                                       the initial bundle, per the v2 spec's performance budget)
```

Pattern Library's detail page (`pattern-detail.component`) shows a "Watch this pattern, step by
step" launcher card under Intuition when `visualizer-registry.ts` has an entry for that pattern
slug — it links to `/visualize/{slug}` rather than embedding `<app-viz-player>` inline, keeping
pattern-detail's own bundle free of the lazy-loaded visualizer engine (see gotchas).

## Design System (v2 Phase A) — `frontend/src/styles/`
```
tokens.scss          ← the ONLY place raw colour/spacing/radius/type/motion values may live.
                         Near-black surfaces (--surface-0 #0A0A0A ... --surface-3), exactly one
                         accent (--accent, electric lime #C7F284), semantic-only state colours
                         (--state-success/warning/error), 4px spacing scale, radius 4/6/8 only,
                         120–180ms motion durations, all zeroed under prefers-reduced-motion via
                         a single :root media query other consumers should key off, not re-query
material-theme.scss  ← replaces the old @angular/material/prebuilt-themes/indigo-pink.css.
                         Custom Sass M2 theme: primary AND accent both resolve to the same lime
                         palette (Material's 3-palette model doesn't map cleanly onto "exactly
                         one accent" otherwise), warn reuses Material's own $red-palette,
                         density: -3 for the "dense-3 form fields" requirement app-wide
fonts.scss            ← self-hosted Inter (300/400/500/600/700) + JetBrains Mono (400/500) via
                         @fontsource, replacing the render-blocking Google Fonts <link> in
                         index.html (Material Icons stays remote — separate concern, an icon
                         glyph font, not the type-pairing decision)
```
`styles.scss` (the pre-existing global stylesheet) now `@use`s all three at the top, in that
order, then continues unchanged below — the old `--bg-0`/`--accent-blue`/`.glass-card` token and
utility layer that every existing page consumes is still there and still fully in effect.

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

## Rebrand: NovaCode → Drona (noir theme)
The app was renamed from "NovaCode" to **Drona**, tagline **"Earn the answer."** — GitHub repo
is now `Shivanshu-23/drona` (renamed via `gh repo rename`, GitHub auto-redirects the old
`cp-mentor` URL). **Deliberately NOT renamed**: the Vercel project (`cp-mentor`) and Render
service (`cp-mentor-backend`) — those stay as-is by explicit user choice, to avoid disturbing
the deploy pipeline/webhook that took real effort to get working (see the "Vercel webhook was
broken" saga below). This means the live URLs (`cp-mentor-delta.vercel.app`,
`cp-mentor-backend.onrender.com`) still say "cp-mentor" even though the product is "Drona" —
expected, not a bug.

Alongside the rename, the app got a **"Spider-Man" visual identity**: near-black backgrounds
with a genuinely varied accent palette (blue, purple, red — plus the existing green/yellow
semantic colours) and hand-built spider-web motifs/animations. **No Marvel name, logo, or
character art is used anywhere** — trademark/copyright risk on a live public app. What's
implemented is the *visual language and motion*, not the IP.
- **First pass was a pure black/white/red "noir" monochrome** (one saturated colour only,
  everything else white/gray) — shipped, built, deployed, and then explicitly rejected by the
  user as "looking very bad." Reverted to a second pass, described below, per direct feedback:
  keep the near-black *backgrounds* (that part landed fine) but restore full colour variety in
  the *accents* rather than stripping them to monochrome. Documented here so a future session
  doesn't reintroduce the monochrome version thinking it's the intended "Spider-Man" look — it
  was tried and turned down.
- **Final palette**: near-black backgrounds (`--bg-0: #0a0a0a` etc., unchanged from the noir
  pass — this part was never in question) + blue (`#58a6ff`) + purple (`#bc8cff`) + red
  (`#f85149`) as three co-equal accents, plus orange (`#ffa657`) and the untouched green/yellow
  semantic colours. This is close to the pre-noir palette; the meaningful, lasting change from
  the whole rebrand is the near-black background depth plus the new spider-web motifs/animations
  below, not a change in the accent hues themselves.
- Both token systems were touched: the legacy `--bg-0`/`--accent-*` family in `styles.scss`
  (consumed by every pre-v2 page) restores full blue/purple/red variety. The v2
  `tokens.scss`/`material-theme.scss` system (command palette, styleguide, visualizer, Material
  chrome) was **deliberately left on its single red accent** rather than reverted further — that
  subsystem's whole design brief is "exactly one accent, used sparingly" (see Phase A), and red
  still reads as an on-theme "spider" colour there. The two systems are intentionally divergent
  now: legacy = varied, v2 = single-accent-by-design.
- Every hardcoded (non-variable) rgba triplet that had been bulk-converted from blue/purple to
  white/gray during the noir pass (`rgba(88,166,255,...)` → `rgba(242,242,242,...)`, and the
  purple equivalent) was reverted back via a second `sed` pass across the same ~10 component SCSS
  files — safe to blanket-reverse because those specific RGB triplets only ever existed from that
  one substitution; text/background hex values (`--text-hi`, `--bg-*`) use separate hex constants
  untouched by the triplet-based sed, so this couldn't collide with the near-black text/background
  values that were deliberately kept.
- **Green/yellow semantic colours (easy/medium difficulty, success/warning) were never touched**
  in either pass — they carry real meaning (already paired with text labels, not colour-only).
- **Pattern Library's header motif** is a hand-built corner spider web (radiating spokes +
  concentric ring polylines, anchored top-right, small red "spider" dot at the anchor) — a spider
  web *is*, mathematically, a graph, so it doubles as on-theme imagery for the page that teaches
  graph-shaped patterns. `preserveAspectRatio` is `xMaxYMin slice` (not `xMidYMid`) — a
  corner-anchored design needs right-edge alignment or it gets cropped on narrow viewports.
  **Now also animated**: the whole web (spokes + rings + spider) sways as one rigid body via a
  `rotate()` pendulum keyframe (`webSway`, 6s ease-in-out) around its anchor point
  (`transform-origin: 800px -20px`), on top of the pre-existing ring-shimmer/spider-breathe
  opacity animations. Requires wrapping the SVG's spokes/rings/spider in a `.web-anchor` `<g>` so
  the rotation has a single group to apply to; freezes under `prefers-reduced-motion`.
- **"Thwip" — a web-strand shoot effect on page navigation** (`app.component.ts`): subscribes to
  `router.events` filtered to `NavigationEnd`, skips the very first (initial-load) event, and on
  every real navigation appends a short-lived fixed-position SVG overlay straight to
  `document.body` (same "survives the triggering component unmounting" pattern as the confetti
  burst) — one line animated in via `stroke-dasharray`/`stroke-dashoffset` from a random top
  corner to a landing point in the upper-middle of the viewport, plus a small circular "impact"
  flash that expands and fades. Total lifetime ~500ms, then the overlay DOM node removes itself.
  Respects `prefers-reduced-motion`. Styled in `styles.scss` (`.thwip-overlay`/`.thwip-strand`/
  `.thwip-impact` + `thwipShoot`/`thwipFade`/`thwipImpact` keyframes) rather than component-scoped
  since it's appended outside any one component's view.
- **The Three.js starfield's nebula/star tinting** carries the same blue/purple/red variety as
  the 2D UI: three nebula sprites (blue/purple/red) instead of the noir pass's white/gray/red, and
  star tinting is a weighted mix (70% neutral white, 15% blue, 10% purple, 5% red) instead of the
  noir pass's 85% white / 15% red split.
- **Dead CSS from the deleted YouTube Videos tab was found and removed while doing the noir
  pass** (`analysis.component.scss` had ~115 lines of orphaned `.video-*` rules, including a
  hardcoded red gradient, left over from the Phase G removal that only touched the HTML/TS). This
  cleanup stands independent of the colour-direction reversal — not undone. Worth a sweep after
  any future feature deletion — removing a template's markup doesn't remove its SCSS.
- **Confetti colours** (Phase F, recall-drill all-PASS trigger) are blue/purple/red/green/orange
  — restored variety, matching the rest of the second pass.

## Vercel auto-deploy silently broke — diagnosis and fix
After the v2 Phases B/C/E/F/G push, Vercel stopped deploying new commits entirely — the
dashboard's "Production" deployment stayed pinned to an old commit for 8+ hours, and every
dashboard "Create Deployment" / "Redeploy" attempt kept rebuilding that SAME stale commit
instead of pulling `master`'s actual HEAD. Root cause: the GitHub App connection/webhook had
gone stale (`gh api repos/<owner>/<repo>/hooks` returned `[]`) even though the Vercel project's
stored git link (`repoId`, `productionBranch`) looked completely correct via the API — the
break was in the GitHub↔Vercel webhook delivery itself, not any inspectable config.
- **Fix**: Vercel dashboard → project → **Settings → Git → Disconnect**, then **Connect Git
  Repository** again and re-select the repo. This forces Vercel to re-register its GitHub App
  webhook from scratch. Confirmed working by pushing a trivial commit and watching a `git`-sourced
  deployment appear automatically within seconds (previously: nothing, ever, no matter how long
  you waited).
- **`cp-mentor-delta.vercel.app` is a manually-pinned alias, not a domain that auto-follows
  production** — even with the webhook fixed and auto-deploy working again, this specific alias
  needs `vercel alias set <deployment> cp-mentor-delta.vercel.app` after every deploy that should
  go live there. The project's own default domain (`cp-mentor-shivanshu-pandeys-projects.vercel.app`)
  DOES auto-follow production and needs no manual step — worth switching to that (or a real custom
  domain, which also auto-follows) if this manual-alias friction becomes a recurring problem.
- **The Vercel project's Root Directory is `cp-mentor/frontend`, relative to the git repo
  root** — running `vercel` CLI commands from *inside* `cp-mentor/frontend` after linking to the
  project causes a doubled path (`.../frontend/cp-mentor/frontend`) and fails immediately. Always
  run `vercel` commands (`link`, `--prod`, etc.) from the actual git repo root
  (`/home/shivanshupandey/Videos/Self Project /Leetcode/`), not from inside the frontend folder.
- **`vercel link` with no `--project` flag can silently create a brand-new empty project**
  instead of linking to the existing one, if run from a directory whose name happens to not
  match — this happened once this session (created a stray empty "frontend" project). Always
  pass `--project <exact-existing-name>` explicitly rather than trusting auto-detection.

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
- **v2 Phase A did NOT reskin the existing app — this is a deliberate scope boundary, not an
  oversight.** The DELIVERY line for that session said "show me tokens.scss, the themed Material
  overrides, and the palette," not "migrate every page." Concretely: (1) real `<mat-*>`
  components — buttons, checkboxes, spinners, form fields, tabs — now render in the new dark
  lime theme app-wide immediately, because overriding Angular Material's theme is inherently
  global; (2) the app's own custom classes (`.glass-card`, `.gradient-text`, badge/chip colours,
  the whole `--bg-0`-family token set in `styles.scss`) are untouched and still render the
  original blue/purple GitHub-dark look. The result right now is a deliberate **hybrid**: Material
  chrome is lime/near-black, custom surfaces are still the old glass theme. This is expected, not
  a bug — full migration of every page to the new tokens is future-phase work, not done yet.
- **`/styleguide`'s "dev-only, tree-shaken from prod" claim is real but partial.** The route is
  gated by `isDevMode()` in `app-routing.module.ts` and the component is standalone +
  lazy-loaded (`loadComponent`), so: the route is genuinely unreachable via the Angular Router in
  a production build (`isDevMode()` resolves via the CLI's standard `ngDevMode` production
  stripping — the same mechanism every Angular app relies on for this exact pattern), and the
  component's code is a separate lazy chunk, never part of the initial bundle. What it does
  *not* do: prevent that lazy chunk file from being written to `dist/` — Angular can't know at
  build time that the runtime check will always be false, so an unreferenced,
  never-fetched-in-prod JS file still ships to the server. True zero-file exclusion would need
  Angular's environment/fileReplacements system, which this codebase doesn't otherwise use and
  wasn't adopted for one dev route. Low-severity either way — the page has no auth-gated or
  sensitive content, it's just a token reference.
- **Command palette data is 100% client-side, reusing existing endpoints** — `/api/v1/method/patterns`
  (via `PatternService`), `/api/v1/problems` (via `ProblemService`), and
  `/api/v1/company-problems/companies` (direct `HttpClient` call, matching how
  `company-tracker.component.ts` already calls that same endpoint — no dedicated company service
  file exists in this codebase yet). No new backend endpoints were added for Phase D; the spec's
  own Phase D scope is entirely frontend.
- **Company Tracker now reads an optional `?company=` query param on init** (added so the command
  palette's company results actually deep-link somewhere) — small, backward-compatible addition;
  falls back to the existing `'amazon'` default when absent.
- **"Toggle theme" from the Phase D action list was deliberately omitted** — there is no second
  (e.g. light) theme anywhere in the app, so a toggle would have nothing to switch to. Building
  one wasn't in Phase A's scope either. Revisit if/when a second theme actually exists.
- **Global keyboard shortcuts are intentionally partial in this phase.** `KeyboardShortcutsService`
  wires up what's cheap and broadly correct right now: `Cmd/Ctrl+K` (palette, works even while
  typing — standard convention), `/` (focuses `[data-shortcut-search]` on the current page,
  currently set on Pattern Library and Company Tracker's search inputs), `g` then `p`/`d` (chord
  nav to Pattern Library / Recall Drill), `?` (help overlay), `Esc` (closes palette/help). It does
  **not** yet implement `j`/`k` list navigation, `t` (timer toggle), `h` (next hint), or
  `Enter`-advances-worksheet-phase from the appendix — those are scoped to the specific
  components they'd live in (solve-session worksheet, recall drill) and are future-phase work,
  not silently dropped.
- **Printable exports are `window.print()`, not generated PDFs** — same approach as Phase 2's
  constraint-analyzer checklist, applied to the Solve Session completion screen (full worksheet
  review) and the Progress Dashboard's trigger log. Zero cost, zero new dependencies, consistent
  with the project's free-hosting constraint. Both pages wrap non-printable UI (nav, forms, stat
  cards on the same page as the log) in `.no-print`.
- **The visualizer engine renders SVG via plain Angular template bindings, not a charting/canvas
  library** — the spec's own hard rule ("no library over 30KB gzipped... no three.js, no
  anime.js, no GSAP"). Every renderer takes `state`/`highlights`/`pointers` as `@Input()`s and
  draws `<rect>`/`<circle>`/`<line>`/`<text>` directly; tweening between frames is plain CSS
  `transition` on those SVG attributes/classes, keyed off the token system's `--duration-*`/
  `--ease-out`. Adding a new algorithm is "write a `.trace.ts` file", never "write new UI" —
  confirmed in practice: all 13 Phase C generators reuse the same 7 renderers.
- **Phase C shipped one representative algorithm per category, not every sub-variant the spec
  described** — e.g. C1 "Array" only covers three-reverse rotation (not also swap/Kadane in the
  same visualizer), C12 "Sorting" is selection sort (not merge/quick/heap sort's dual views).
  This was a deliberate scope cut under real time constraints, not an oversight — each shipped
  generator is fully correct and uses the real algorithm, just narrower coverage than the spec's
  wishlist. Two exceptions got extra coverage instead of less: C2 "Two Pointer & Sliding Window"
  shipped as *two* separate catalog entries (`two-pointer-sum` + `sliding-window-unique`) since
  the spec explicitly flagged it as the highest-value visualizer in the whole document.
- **`visualizer-catalog.ts` vs `visualizer-registry.ts` is a deliberate, load-bearing split, not
  duplication to clean up.** The catalog imports every trace-generator function (the actual
  algorithm logic) and is only ever imported from the lazy `/visualize/:slug` route. The registry
  is a hand-maintained, generator-free metadata list (slug/title/patternSlug) that
  `pattern-detail.component` (part of the eager `AppModule` bundle) imports instead, specifically
  so the "Watch this pattern, step by step" launcher doesn't drag the whole visualizer engine into
  every page load. **Keeping these in sync is manual** — a new visualizer with a `patternSlug`
  needs an entry in both files. This was checked and confirmed to actually work: the lazy
  `visualizer-page-component` chunk size didn't change when the pattern-detail launcher was added.
- **`GET /api/v1/visualizers` from the spec's "BACKEND FOR THIS PHASE" list was never built** —
  deliberately, not an oversight. Trace generation is 100% client-side by the spec's own design
  ("Trace generation happens client-side; do not round-trip animation frames"), and
  `visualizer-catalog.ts` already serves as the metadata source the frontend needs. A backend
  endpoint duplicating that same metadata would exist only to be unused.
- **Phase E's `ComplexityBudget` table duplicates, but is not wired to,
  `ConstraintAnalyzerService`'s hardcoded table (Phase 2).** The spec says the new table "Powers
  the Phase 2 analyser" — that would mean refactoring already-shipped, tested logic to read from
  the DB instead of a Java `List.of(...)`, which is real risk for a "content seeding" phase to
  take on. Both currently hold the identical 7-row table by hand; if one changes, the other must
  be updated too until someone deliberately does that consolidation refactor.
- **`TriggerPhrase` (Phase E6, the static phrase→pattern dictionary) is a different entity from
  `TriggerEntry` (Phase 5, the user's personal spaced-repetition log)** — same domain word,
  unrelated tables (`trigger_phrases` vs `trigger_entries`), unrelated purpose (reference data vs
  user data). Do not conflate them; `TriggerPhrase` has nothing to do with spaced repetition.
- **`TopicPriority.rank` is mapped to column `topic_rank`, not `rank`** — `RANK` became a reserved
  word in MySQL 8.0.2+ (window functions). Same class of gotcha as `TriggerEntry.trigger` ->
  `trigger_text`; caught the same way (migration failed with a syntax error pointing right at the
  column, fixed before it ever reached anything beyond local dev).
- **`ComplexityBudget.maxNLabel` needed an explicit `@Column(name = "max_n_label")`** — Hibernate's
  default naming strategy mangled the adjacent-capitals field name to `maxnlabel` instead of
  `max_n_label`, failing schema validation. Any future field with a single-capital-letter segment
  next to another capital (`...N<Capital>...`) should get an explicit `@Column` name rather than
  trusting the naming strategy.
- **`double` Java fields need `DOUBLE` migration columns, not `DECIMAL`** — `TriggerPhrase.confidence`
  and `TopicPriority.estimatedHours` both originally used `DECIMAL(n,n)` in the migration, which
  Hibernate schema-validation rejected against a `double`-typed field (Hibernate expects
  `FLOAT(53)`/`DOUBLE`). Fixed before the migration ever reached a real deploy.
- **Phase F's pattern-mastery tiers are a specific, documented interpretation** of "based on PASS
  count at increasing review stages" (the spec doesn't give exact thresholds): LEARNING (no PASS
  entries) → FAMILIAR (1-2 PASS) → SOLID (3+ PASS) → MASTERED (at least one entry reached
  `reviewStage 3`, i.e. "retired" per Phase 5's own scheduling). This mirrors the SOLID threshold
  used by the pre-existing "patterns mastered" stat (Phase 5, "3+ PASS entries") for consistency,
  and adds MASTERED as a genuinely higher bar on top of it.
- **Recall streak has a same-day grace period** — if today has no recall-drill review yet, the
  streak still counts through yesterday rather than showing 0 the instant the user wakes up
  (which would be a demoralizing, arguably-wrong UX for a retention feature). Only a day with zero
  activity that has *already fully passed* breaks the streak.
- **The share-card PNG is hand-drawn with `java.awt.Graphics2D`, not a library** — zero new backend
  dependencies, consistent with the project's free-hosting constraint. Uses only JDK logical fonts
  (`Font.MONOSPACED`/`Font.SANS_SERIF`) since Render's JRE image can't be assumed to have
  JetBrains Mono/Inter installed as system fonts — do NOT try to reference those font names by
  string; it silently falls back to a default face if the name isn't resolvable.
- **Confetti (Phase F, all-PASS recall drill) is appended to `document.body`, not rendered inside
  Angular's component tree** — needed so a burst outlives the component navigating away
  mid-animation, but it also means the styling lives in the GLOBAL `styles.scss`
  (`.confetti-burst`/`.confetti-piece`), not `recall-drill.component.scss`. Angular's emulated
  view encapsulation doesn't reach dynamically-created DOM nodes appended outside the component's
  own template, so component-scoped styles silently wouldn't apply here.
- **The AI degraded state (`degraded: true`) only fires outside the `test` Spring profile** —
  checked via `Environment.acceptsProfiles(Profiles.of("test"))`, not a manual flag. The richer
  `buildConceptFallback` (curated notes by topic tag) still exists and still runs in `test`, so
  any future test asserting on that fallback's shape doesn't need to change. Prod/dev see the
  new minimal `buildDegradedState` instead whenever every real provider (Gemini/OpenAI/Claude)
  fails — which, per BUG 3, is a live path, not a hypothetical.
- **The YouTube integration was deleted outright, not deprecated** — the entire
  `com.cpmentor.youtube` package (controller/service/DTO), `GET /api/v1/videos` from
  `SecurityConfig`, `youtube.*` from `application.yml`, and all frontend references
  (`ProblemService.getVideos`, `VideoDTO`, Analysis page's Videos tab) are gone. This does NOT
  touch the plain-text YouTube *links* inside Home's "Free Learning Roadmap"
  (`resources.data.ts`) — those were always just external URLs, unrelated to the deleted API
  integration; verified no overlap before deleting anything.
- **The problem bank (`Problem`/`DailyChallenge`) was investigated, not deleted, per explicit user
  instruction** ("investigate and report back first"). Findings: it genuinely is a raw
  LeetCode scrape with zero curation (`LeetCodeFetchService` reconstitutes LeetCode's own HTML
  into text fields; nothing original). But the blast radius of deleting it isn't as contained as
  "just a mirror" implies — `AIService.analyze(Long problemId)` has a hard dependency on
  `Problem`'s internal DB id (not `leetcodeId`) for prompt-building, and the Analysis page's route
  is keyed the same way. Company Tracker, Pattern Library, and Solve Session already treat
  `leetcodeId` as a plain string with zero `Problem` dependency, so they're unaffected either way.
  **Deletion is feasible but is a real refactor of `AIService`'s core contract (re-keying to
  `leetcodeId`, fetching problem text on demand), not a cleanup — treat as its own scoped task if
  pursued, don't fold it into a future "quick removal" pass.**
- **Admin credential rotation is prepared but NOT applied** — see BUG 4 above. The new password
  and its BCrypt hash were shared with the user directly in chat, deliberately not committed to
  this file — applying them needs the production Aiven MySQL connection string, which this
  session didn't have. Whoever runs the `UPDATE` statement should update BUG 4's status here
  afterward, and rotate again in the future rather than treating a chat-shared credential as
  long-term-safe.

## Environment Variables
```bash
GEMINI_API_KEY=    # Google Gemini (free) — get from aistudio.google.com/app/apikey
OPENAI_API_KEY=    # Optional — GPT-4o-mini fallback
CLAUDE_API_KEY=    # Optional — Claude Haiku fallback
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
- AI Analysis — Gemini/OpenAI/Claude, with an honest `degraded: true` state in prod/dev (no
  fabricated content) when every provider fails — v2 Phase G, see gotchas
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
- Angular Material dark theme UI — Home, Analysis (2 tabs), Login, Register, Company Tracker
  (+ pattern filter), Pattern Library (grid + detail), Constraint Analyzer, Solve Sessions
  (+ printable completion review), Recall Drill, Progress Dashboard (+ printable trigger log
  + v2 Phase F mastery card)
- Swagger UI at /swagger-ui.html
- `docker-compose.yml` (cp-mentor root) — one-command local MySQL
- **Live on the free stack**: Vercel (frontend) + Render free web service (backend) + Aiven
  free MySQL (persistence). Render free tier spins down after 15 min idle — first request
  after a quiet period is slow (cold start), that's expected.

- **Drona v2 Phase A — Design System**: `tokens.scss` (near-black surfaces, one lime accent,
  4px spacing, 4/6/8 radius, type scale, 120–180ms motion), a custom Material theme built from
  those tokens (density -3), self-hosted Inter + JetBrains Mono via `@fontsource`, a dev-only
  `/styleguide` reference page. Existing pages NOT yet migrated to the new tokens — see gotchas.
- **Drona v2 Phase B — Visualizer Engine**: shared `<app-viz-player>` (keyboard-driven
  play/pause/step/scrub/speed) + 7 SVG structure renderers + the Frame/Trace model. Lazy-loaded,
  standalone — see gotchas for the catalog/registry split that keeps it out of the eager bundle.
- **Drona v2 Phase C — 12 visualizer categories, 13 trace generators**: array rotation,
  two-pointer pair-sum, sliding-window longest-unique-substring, Dutch flag, anagram frequency
  array, monotonic-stack next-greater, prefix-sum range query, linked-list fast/slow cycle
  detection, tree in-order DFS, trie insert/search, graph BFS wave, DP-table climbing stairs,
  selection sort. Reachable at `/visualize/{slug}`, plus a launcher card on the matching
  pattern's detail page. One representative algorithm per category, not every sub-variant
  described in the spec — see gotchas.
- **Drona v2 Phase D — Command Palette**: `Cmd/Ctrl+K` opens a fuzzy-search palette (patterns,
  problems, companies, static routes/actions, recent items via localStorage), fully keyboard-
  driven (arrows/Enter/Esc), built from scratch with no new dependency. Global shortcuts: `/`
  focus-search, `g p` / `g d` chord navigation, `?` help overlay. Scope note: `j`/`k`, `t`, `h`,
  and worksheet `Enter`-advance are deferred to later, component-specific work — see gotchas.
- **Drona v2 Phase E — Method content**: 9 seeded reference-data entities (5 method phases,
  7-row complexity budget, 5 optimization moves, 6 stuck rungs, 5 recovery steps, 21 trigger
  phrases w/ antiTriggers, 35-topic priority curriculum, 8-step interview script, company/pattern
  frequency join), all public + cached. Frontend service exists (`method-content.service.ts`) but
  no page consumes it yet — deeper integration (gating the solve-session stepper by rung timers,
  the mandatory recovery checklist at hint level 4, the interview script on the completion
  screen) is deferred, not built this round.
- **Drona v2 Phase F — Retention-weighted gamification**: recall streak (with a same-day grace
  period), pattern mastery tiers (Learning/Familiar/Solid/Mastered) as a tile grid, submissions-
  per-accepted with an 8-week trend, a hand-drawn PNG share card (`java.awt.Graphics2D`, zero new
  deps, rate-limited 10/day) on the Progress Dashboard. Confetti fires once, on completing a full
  recall drill with every entry PASS — the one place the design brief allows it.
- **Drona v2 Phase G — Removals**: honest `degraded: true` AI state in prod/dev (mock/concept
  fallback survives in `test` profile only), YouTube integration deleted entirely
  (frontend + backend + config), Analysis page collapsed 5→2 tabs, per-user `leetcodeUsername`
  (`/leetcode-stats/me`, `/leetcode-stats/{username}`, 10-min cache with stale-on-error) replacing
  the hardcoded default. Problem bank was investigated per explicit instruction and NOT deleted —
  see gotchas for why the blast radius is bigger than "just a mirror" implied. Admin credential
  rotation prepared but blocked on missing prod DB access — see BUG 4.

## What's Pending ❌
- [ ] Admin credential rotation — generated, not yet applied to production (BUG 4)
- [ ] Deeper Phase E integration into Solve Session / Recall Drill UI (stepper rung-gating,
      mandatory recovery checklist, interview script on completion)
- [ ] Full app reskin to the v2 design tokens (Phase A only touched Material chrome + new
      components; `.glass-card`/`--bg-0` pages are untouched)
- [ ] Remaining Phase D shortcuts: `j`/`k` list nav, `t`/`h` worksheet shortcuts
- [ ] Problem bank deletion (investigated, not decided — see gotchas; would need `AIService`
      re-keyed from `Problem.id` to `leetcodeId` first)
- [ ] Redis — caching layer (MySQL persistence is done; Redis not started)
- [ ] Docker Compose for the full app (backend + frontend containers — currently MySQL only)
- [ ] Bookmarks + Notes + History
- [ ] GitHub Actions CI/CD

## Next Steps Priority
1. Apply the admin credential rotation (BUG 4) once production DB access is available
2. Redis setup
3. Docker Compose for backend + frontend
4. GitHub Actions CI/CD


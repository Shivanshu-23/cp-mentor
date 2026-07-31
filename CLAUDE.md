# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo is not a git repository and currently contains a single project, `cp-mentor/` — an AI-powered competitive-programming mentor app with a Spring Boot backend and an Angular frontend. All commands below assume `cp-mentor/` as the base unless noted.

## Commands

### Backend (`cp-mentor/backend`, Java 21 + Spring Boot 3 + Maven)

```bash
cd cp-mentor/backend
mvn spring-boot:run              # run the API on :8080 (H2 in-memory DB, no external services needed)
mvn test                         # run tests
mvn test -Dtest=ClassName#method # run a single test
mvn clean package                # build the jar
```

There are currently no test classes under `src/test/java` — the test source tree exists but is empty.

### Frontend (`cp-mentor/frontend`, Angular 17 + Material)

```bash
cd cp-mentor/frontend
npm install
npm start        # ng serve --proxy-config proxy.conf.json, on :4200, proxies /api → :8080
npm run build     # production build
npm run watch     # dev build in watch mode
```

There is no configured lint or test script in `package.json` (default Angular CLI scaffolding was not extended with `test`/`lint`).

### Running both together

`cp-mentor/start.sh` starts the backend, polls `/v3/api-docs` until it's up, then starts `ng serve --open`. It prompts interactively for `OPENAI_API_KEY` / `YOUTUBE_API_KEY` (blank is fine — falls back to mock data).

### Useful URLs when running

- Frontend: http://localhost:4200
- Backend: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 console: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:cpmentor`, user `sa`, blank password)

## Architecture

### Backend package-by-feature structure

Under `com.cpmentor`, each feature is its own top-level package with its own `controller/service/repository/entity/dto` subpackages (not layered globally by type):

- `auth` — JWT registration/login. `JwtAuthFilter` (a `OncePerRequestFilter`) sits in front of Spring Security; `JwtUtil` issues/validates tokens; `SecurityConfig` wires the filter chain, CORS (only `http://localhost:4200` is allowed), and stateless sessions.
- `problem` — core `Problem` entity/CRUD, seeded by `common/DataInitializer` on first boot (3 sample problems: Two Sum, Longest Substring, Best Time to Buy/Sell Stock) so the app is usable without any external data source.
- `ai` — `AIService` is the single entry point for problem analysis (`/api/v1/ai/analyze/{id}`). It tries providers in a fixed fallback chain: **Gemini → OpenAI → Claude → mock**, each gated by whether the corresponding API key is non-blank (`gemini.api-key` / `openai.api-key` / `claude.api-key`). Gemini itself falls back across models (`gemini-1.5-flash` → `gemini-1.5-flash-8b` → `gemini-2.0-flash`). All three providers are called with raw `HttpURLConnection` (no SDK), and responses are parsed as a single big JSON blob (summary, 3-level explanations, brute/better/optimal solutions with code, interview tips, flash cards, etc.) matching the `AIAnalysisDTO` shape — the prompt in `buildPrompt()` and the DTO fields must stay in sync. When every provider is absent/fails, `buildMockAnalysis()` returns a static placeholder response, so the endpoint always returns 200.
- `company` — company-wise interview question tracking. `CompanyDataLoaderService` asynchronously fetches CSVs (`ID,URL,Title,Difficulty,AcceptanceRate%,Frequency%`) from the public GitHub repo `snehasishroy/leetcode-companywise-interview-questions` for a hardcoded list of companies × timeframes (`all`/`six-months`/`thirty-days`) on `ApplicationReadyEvent`, skipping any company/timeframe already loaded. `UserProblemProgress` tracks per-user solve state against these problems.
- `ingestion` — `DailyChallengeScheduler` fetches LeetCode's daily challenge via `LeetCodeFetchService` on app startup and on two scheduled crons (`0 30 18 * * ?` and `0 30 19 * * ?` UTC — timed for LeetCode's midnight-UTC reset plus a safety retry at IST midnight).
- `youtube` — fetches tutorial video suggestions per problem/topic; also falls back to mock data when `youtube.api-key` is blank.
- `exception` — `GlobalExceptionHandler` for centralized error responses.

Note: a handful of literal directories named things like `{entity,repository,dto,service,controller}` exist under `com/cpmentor/` (leftover from a brace-expansion `mkdir` that didn't expand) — these are empty and not part of the real package structure; ignore them.

Config-driven provider fallback is the main architectural idiom to be aware of: `AIService` and `YouTubeService` both treat "external API key not configured" as a normal state, not an error, and silently degrade to mock output rather than failing the request. When adding a new field to an AI analysis response, it must be added in three places kept in sync: the prompt's requested-keys list in `AIService.buildPrompt()`, the parsing in `parseJsonResponse()`, and `AIAnalysisDTO`.

Security: all endpoints are open (`permitAll`) except `POST`/mutating routes, per `SecurityConfig` — `/api/v1/auth/**`, all `GET /api/v1/problems/**`, `GET /api/v1/videos/**`, `GET /api/v1/ai/**`, `/api/v1/daily-challenge/**`, and `GET /api/v1/company-problems/companies` require no auth; everything else requires a valid JWT bearer token.

`gemini.api-key` follows the same `${ENV_VAR:}` pattern as `openai.api-key` / `claude.api-key` (`GEMINI_API_KEY`) — a previous version of this file had it hardcoded in plaintext; that key has been rotated and removed from source. Never hardcode provider keys in `application.yml` going forward.

### Frontend structure

Angular 17, NgModule-based (not standalone components), Material UI. `src/app/`:

- `core/` — `services/` (`auth.service.ts`, `problem.service.ts`), `interceptors/auth.interceptor.ts` (attaches JWT to outgoing requests), `guards/auth.guard.ts` (route protection).
- `features/` — one folder per routed page: `home` (daily problem + list), `analysis` (4-tab AI analysis view: explanation / solutions / interview tips / revision notes — mirrors `AIAnalysisDTO`'s shape), `login`, `register`, `company-tracker`.

Routing (`app-routing.module.ts`) is flat, one route per feature component; `/api` calls are proxied to `localhost:8080` in dev via `proxy.conf.json`.

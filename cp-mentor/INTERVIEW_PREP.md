# Drona — Interview Prep

## 30-second pitch
"Drona is a full-stack DSA interview-prep platform — Spring Boot backend, Angular 17
frontend — built around teaching a *structured method* for approaching problems, not just
listing problems to grind. It has a 5-phase guided worksheet (constraints → restate →
hand-solve → bottleneck → code), an AI-free pattern-recognition and progressive-hint system
that's deliberately designed to never leak a solution, spaced-repetition retention tracking,
a 25-pattern reference library with hand-built SVG algorithm visualizers, and a company-wise
question tracker sourced from a GitHub CSV dataset. It also pulls LeetCode's daily challenge
automatically via GraphQL and uses an AI provider chain (Gemini → OpenAI → Claude →
degraded-but-honest fallback) for deeper analysis. Everything's secured by JWT, the whole
stack runs on free infra (Vercel + Render + Aiven MySQL), and the reference/teaching content
is server-side-rendered and works even with the backend fully stopped."

**Quick-reference — what's actually in it** (see the dedicated sections below for depth on
each):

| Area | What it is |
|---|---|
| **Auth** | Stateless JWT, BCrypt, Spring Security filter chain |
| **AI pipeline** | Gemini → OpenAI → Claude fallback chain, response caching, honest `degraded: true` state (never fabricates content) |
| **Practice Method** | 5-phase solve worksheet, AI-free pattern ID + progressive hints (solution-leakage prevention), spaced-repetition trigger log, 25-pattern library |
| **Visualizer engine** | One shared trace-player component + 13 algorithm trace generators (SVG, no canvas/animation library) |
| **Company Tracker** | GitHub-CSV-sourced, per-user tick-mark progress, pattern cross-linking |
| **Frontend architecture** | Angular 17, standalone + lazy-loaded routes, typed static content layer, SSR + prerendering |
| **Design system** | Custom design tokens, hand-built SVG motifs/animation, command palette (Cmd/Ctrl+K) |
| **Deployment** | Vercel (frontend, SSR) + Render (backend) + Aiven (MySQL) — all free tier |
| **Data persistence** | MySQL 8 + Flyway migrations, `ddl-auto: validate` only |

---

## 1. Authentication (JWT, stateless)

**How does login work end-to-end?**
- `POST /api/v1/auth/login` → `AuthService` calls Spring's `AuthenticationManager` with a
  `DaoAuthenticationProvider` (uses `BCryptPasswordEncoder` + `CustomUserDetailsService` to
  load the user from H2).
- On success, `JwtUtil.generateToken()` builds a JWT: subject = username, issuedAt,
  expiration, signed with an HMAC-SHA key (`Keys.hmacShaKeyFor`) derived from a Base64
  secret (`jwt.secret` property).
- Token returned to client, stored in `localStorage` on the Angular side.
- Every subsequent request goes through `AuthInterceptor`
  (frontend/src/app/core/interceptors/auth.interceptor.ts), which reads the token via
  `authService.getToken()` and clones the outgoing request with an
  `Authorization: Bearer <token>` header — it doesn't mutate state, just adds a header per
  request (standard Angular `HttpInterceptor` pattern).
- On the backend, `JwtAuthFilter` (extends `OncePerRequestFilter`) runs **before**
  `UsernamePasswordAuthenticationFilter` in the chain. It extracts the Bearer token,
  validates username + expiry via `JwtUtil.isTokenValid()`, and if valid, manually builds
  a `UsernamePasswordAuthenticationToken` and puts it in `SecurityContextHolder` — this is
  what makes the request "authenticated" for anything downstream.

**Why stateless JWT instead of sessions?**
No server-side session store needed — horizontally scalable, no sticky sessions, fits a
REST API. Trade-off: can't revoke a token before expiry without a blocklist (not
implemented here — good thing to volunteer as a known limitation/next step).

**Why `@Lazy` on AuthenticationManager / a specific pattern here?**
There's a circular dependency: `JwtAuthFilter` needs `CustomUserDetailsService`, which is
wired through `SecurityConfig`, which builds the filter chain that includes
`JwtAuthFilter`. Using the concrete `CustomUserDetailsService` type (not the
`UserDetailsService` interface) and constructing `AuthenticationManager` from
`AuthenticationConfiguration` bean lazily breaks the cycle — this is a real gotcha worth
mentioning if asked about Spring Security pitfalls.

**Security config specifics** (`SecurityConfig.java`):
- CSRF disabled (stateless JWT API, no cookies for auth — CSRF only matters when the
  browser auto-attaches credentials).
- CORS configured explicitly with `allowCredentials(true)` and origins from a property
  (`cors.allowed-origins`), not a wildcard.
- Public: `/api/v1/auth/**`, H2 console, Swagger, GET on `/problems`, `/videos`, `/ai`,
  `/daily-challenge/**`, and GET on `/company-problems/**`. Everything else requires a
  valid JWT.
- Passwords hashed with `BCryptPasswordEncoder` — never stored/compared in plaintext.

### 1a. Register/Login flow — deeper dive

**Walk through registration end-to-end, backend side.**
```java
@Transactional
public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByEmail(request.getEmail()))
        throw new IllegalArgumentException("Email already in use: " + request.getEmail());
    if (userRepository.existsByUsername(request.getUsername()))
        throw new IllegalArgumentException("Username already taken: " + request.getUsername());

    User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .build();

    userRepository.save(user);
    String token = jwtUtil.generateToken(user);
    return buildResponse(user, token);
}
```
Two explicit uniqueness pre-checks (email, then username) that throw a descriptive
`IllegalArgumentException` — this gives a clear, specific error message ("Email already in
use" vs "Username already taken") instead of relying on the DB's unique-constraint
violation to surface as a generic 500. The password is hashed via `BCryptPasswordEncoder`
before it ever touches the `User` entity — `passwordHash` is the only password-shaped field
that gets persisted; the plaintext password only exists in the `RegisterRequest` DTO for
the duration of the request. Registration **immediately logs the user in** — it generates
and returns a JWT in the same response, so there's no separate "register, then log in
again" round trip.

**Why validate uniqueness in the service layer instead of just relying on the DB's
`unique = true` constraints on `username`/`email`?**
Both layers exist here, deliberately: the DB constraint (`@Column(unique = true)` on
`User.username` and `User.email`) is the actual source of truth / last line of defense
against races (e.g. two near-simultaneous register calls for the same email — the
service-layer check alone has a TOCTOU gap between the `existsByEmail` check and the
`save()`), while the service-layer check exists purely for **UX** — turning a raw
`DataIntegrityViolationException`/SQL constraint error into a clean, specific
`IllegalArgumentException` message the frontend can display directly. Good one to flag if
asked "is there still a race condition here" — yes, technically, under concurrent
registration for the same email, though the DB constraint prevents actual duplicate rows;
it would just surface as an unhandled exception rather than the friendly message in that
narrow race window.

**Why does `login()` call `authenticationManager.authenticate(...)` instead of just
loading the user and comparing the password hash manually?**
```java
public AuthResponse login(LoginRequest request) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
    );
    User user = (User) userDetailsService.loadUserByUsername(request.getEmail());
    String token = jwtUtil.generateToken(user);
    return buildResponse(user, token);
}
```
Delegating to Spring Security's `AuthenticationManager` (backed by the
`DaoAuthenticationProvider` configured in `SecurityConfig`) reuses the framework's own
tested password-comparison logic (`PasswordEncoder.matches()`, which handles BCrypt's
salt-embedded-in-hash comparison correctly) instead of hand-rolling it — and it
automatically throws a standard `BadCredentialsException` on mismatch, `Disabled/Locked
exceptions` if those `UserDetails` flags were ever wired to real logic, etc. Writing this
by hand (`passwordEncoder.matches(rawPassword, user.getPasswordHash())`) would work too,
but re-implements what the framework already provides and is more error-prone (e.g.
forgetting to use a constant-time comparison — BCrypt's `matches()` already handles that
correctly).

**Note the `authenticate()` call's result is discarded — is that a bug?**
No — calling `authenticate()` is used purely for its **side effect of throwing** on bad
credentials; the returned `Authentication` object isn't needed here because `login()`
immediately re-loads the `User` itself via `userDetailsService.loadUserByUsername(...)` to
build the JWT. A slightly more idiomatic version might capture the returned principal
instead of a second DB round-trip, but as written it's functionally correct — worth being
able to explain rather than assume it's an oversight if asked.

**`User implements UserDetails` directly — walk through why `getUsername()` returns
`email`, and the bug this caused.**
```java
@Override
public String getUsername() {
    return email; // UserDetails contract: email is the Spring Security principal
}

public String getDisplayUsername() {
    return username;
}
```
This app authenticates by **email**, not a separate username field — `CustomUserDetailsService.
loadUserByUsername(String email)` looks users up by email (§7 already covers the knock-on
effect: every `user.getUsername()` call throughout the app, e.g. in
`CompanyProblemController`, actually returns the email). Since `User` implements the
`UserDetails` interface directly, `getUsername()` is a **framework-contractual method
name** it's forced to override — Lombok's `@Data` can't also generate a getter for the
entity's own `username` field under that same method name, so `getDisplayUsername()` exists
as the escape hatch to expose the user's chosen display name separately.
This is exactly the root cause behind a real bug you shipped a fix for: `AuthResponse` was
originally built from `user.getUsername()` (→ email) instead of `user.getDisplayUsername()`
(→ the actual username) in `buildResponse()`, so the login/register response — and
therefore the toolbar/UI — showed the user's **email** where their **username** should
have appeared. The fix was routing `buildResponse()` to call `.getDisplayUsername()`
specifically for the `AuthResponse.username` field:
```java
private AuthResponse buildResponse(User user, String token) {
    return AuthResponse.builder()
            .token(token).tokenType("Bearer").expiresIn(86400)
            .username(user.getDisplayUsername())   // not getUsername() — that returns email
            .email(user.getEmail())
            .role(user.getRole().name())
            .build();
}
```
Great bug story for an interview: a naming collision between a domain concept (the
username the user picked) and a framework contract (`UserDetails.getUsername()`, which
this app repurposes to mean "the login identifier," which happens to be email) — the fix
is understanding *why* two differently-named getters exist and using the right one at the
API boundary.

**What does `expiresIn: 86400` mean, and is the actual JWT expiry tied to it?**
`86400` seconds = 24 hours, returned in the response purely as **informational metadata**
for the frontend (e.g. so it could show "session expires in X" if it wanted to) — it's a
hardcoded literal in `buildResponse()`, not read from the same `jwt.expiration` property
that `JwtUtil.generateToken()` actually uses to set the token's real expiry claim. Worth
flagging as a latent bug/inconsistency if asked to review this code: if `jwt.expiration`
in config were ever changed, this hardcoded `86400` would silently go stale and no longer
match the JWT's actual `exp` claim — the fix would be injecting the same `@Value("${jwt.
expiration}")` here (converted to seconds) instead of a second hardcoded literal.

**How is request validation enforced (`@Valid`, `@NotBlank`, `@Email`, `@Size`)?**
`AuthDTOs.RegisterRequest`/`LoginRequest` use Jakarta Bean Validation annotations
(`@NotBlank`, `@Email`, `@Size(min=3, max=30)` for username, `@Size(min=6, max=100)` for
password), and the controller methods are annotated `@Valid @RequestBody` — Spring
automatically runs these validators before the method body executes and returns a 400 with
field-level error details if any fail, via `GlobalExceptionHandler`'s handling of
`MethodArgumentNotValidException`. This means malformed requests (blank password, invalid
email format, 2-character username) never even reach `AuthService` — validation happens at
the API boundary, not scattered through business logic.

**Why keep all three DTOs (`LoginRequest`, `RegisterRequest`, `AuthResponse`) in one file
(`AuthDTOs.java`) as nested static classes instead of three separate files?**
Explicit comment in the code: "Keeping all auth DTOs in one file for brevity" — a
deliberate, pragmatic choice for a small, tightly-related group of DTOs that only exist to
serve the two auth endpoints. Trade-off worth naming: fine at this scale, but if the auth
module grew (password reset, email verification, OAuth, etc.), splitting back into
one-file-per-DTO would keep diffs smaller and imports clearer — good example of "know when
a convenience shortcut stops paying for itself."

**Frontend: how do the login/register forms validate before ever hitting the network?**
Both `LoginComponent` and `RegisterComponent` use **Reactive Forms** (`FormBuilder`,
`Validators`) with client-side validators that mirror the backend's Bean Validation rules
almost exactly — e.g. `Validators.minLength(3)`/`maxLength(30)` on username and
`Validators.minLength(6)` on password match `@Size(min=3,max=30)` / `@Size(min=6,max=100)`
server-side. `submit()` early-returns if `this.form.invalid`, so obviously-bad input never
even generates an HTTP request. This is defense in depth, not a security boundary — the
frontend validation is UX-only (instant feedback, no round trip for an empty field); the
backend's `@Valid` annotations are what actually can't be bypassed, since a request can
always be sent directly (curl, Postman) skipping the Angular form entirely.

**How does the frontend surface a backend validation/uniqueness error to the user?**
```ts
error: (err) => {
  this.loading = false;
  this.snackBar.open(err.error?.message ?? 'Registration failed', 'Close', { duration: 4000 });
}
```
Reads `err.error?.message` — the error body Spring's `GlobalExceptionHandler` returns for
a failed request (e.g. the `IllegalArgumentException` message "Email already in use: ...")
— with a safe fallback string if that shape isn't present (network failure, unexpected
error format, CORS issue). The optional chaining (`?.`) matters here: a raw network error
(no response at all) wouldn't have `err.error`, so accessing `.message` on `undefined`
would throw if not guarded.

---

## 2. AI Analysis pipeline (the standout feature)

**Walk me through what happens when a user requests an AI analysis.**
`AIService.analyze(problemId)` implements a **fallback chain**, not a single API call:
1. If `GEMINI_API_KEY` is set, try 3 Gemini models in order (`gemini-1.5-flash` →
   `gemini-1.5-flash-8b` → `gemini-2.0-flash`).
2. If Gemini fails with an **account-level error** (429/quota, 401/403 auth) it breaks out
   immediately instead of retrying the other two models with the same doomed key — a small
   but deliberate optimization (`isAccountLevelError()`), since retrying is pointless if
   the key itself is the problem.
3. Falls through to OpenAI (`gpt-4o-mini`), then Claude (`claude-haiku-4-5`).
4. If nothing works, returns a **static concept fallback** — not an error, but a curated
   lookup table (`TOPIC_CONCEPTS`, ~25 DSA topics) keyed by the problem's topic tags, so
   the user still gets useful notes even with zero working API keys.

**Why is this a good design to talk about?** It's the Strategy/Chain-of-Responsibility
pattern applied pragmatically — degrade gracefully instead of failing hard. Good talking
point: "the system never returns a blank error screen to the user, worst case they get
static curated notes instead of a live AI response."

**Why `HttpURLConnection` instead of Spring's `WebClient`/`RestTemplate`?**
Explicit choice noted in code — avoids serialization/reactive-stream edge cases that came
up with WebClient for these specific external calls; raw HTTP gives full control over
headers (e.g. Gemini needs the key in an `X-goog-api-key` header, not a query param — an
actual gotcha you hit) and precise timeout control.

**How is the AI response parsed?** The prompt explicitly asks the model to return raw JSON
(no markdown fences) with a fixed key schema (`problemSummary`, `bruteForce{...}`,
`betterApproach{...}`, `optimalApproach{...}`, etc). The parser strips any accidental
```json fences defensively, then maps it into a typed `AIAnalysisDTO` via Jackson. This is
essentially structured-output prompting without a formal JSON-schema/function-calling API
— worth mentioning that a more robust version would use Gemini's/OpenAI's native
structured output mode.

### 2a. AI Service — deeper dive

**Walk through the exact HTTP call to Gemini, line by line.**
```java
URL url = new URL("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent");
HttpURLConnection conn = (HttpURLConnection) url.openConnection();
conn.setRequestMethod("POST");
conn.setRequestProperty("Content-Type", "application/json");
conn.setRequestProperty("X-goog-api-key", geminiKey);
conn.setDoOutput(true);
conn.setConnectTimeout(8000);
conn.setReadTimeout(25000);
```
- `setDoOutput(true)` is required whenever you're going to write a request body on a
  `HttpURLConnection` — without it, `getOutputStream()` throws.
- The key goes in the `X-goog-api-key` **header**, not a `?key=` query param — the bug you
  actually hit while building this. Query-param API keys leak into server access logs and
  browser history; header-based keys don't, so this is also the *more secure* of the two
  patterns Google supports.
- Request body is built as a raw JSON string (not a POJO + Jackson serialization) —
  `objectMapper.writeValueAsString(prompt)` is used just to safely **escape** the prompt
  text into a JSON string literal (handles quotes/newlines/unicode), then that's spliced
  into a hand-written JSON template. Faster to write than a full request DTO for a
  single-use payload shape, at the cost of being harder to extend later.

**Why do Gemini's timeouts (8s connect / 25s read) differ from OpenAI/Claude's (30s /
60s)?**
Gemini is the **primary, first-tried** path — most requests should succeed here, and
because there are 3 Gemini models tried in sequence, each one needs a tight timeout or a
user could wait 3× a generous timeout before ever reaching OpenAI/Claude. OpenAI/Claude are
fallback paths tried at most once, so a longer timeout there doesn't compound. This is a
deliberate latency budget decision, not an arbitrary number — good to be able to explain if
asked "why these specific values."

**How do you tell the difference between "the model failed" and "the model responded but
wrapped an error in a 200"?**
Two separate checks in `analyzeWithGemini()`:
```java
if (code != 200) { throw new RuntimeException(code + " " + raw.substring(0, Math.min(200, raw.length()))); }
JsonNode root = objectMapper.readTree(raw);
if (root.has("error")) { throw new RuntimeException(...); }
```
First checks the HTTP status code (network/auth/quota-level failures). Second checks
*inside* a 200 response body for a `"error"` field, since some APIs return errors as valid
JSON with a 200 status rather than a 4xx/5xx. The `substring(0, Math.min(200, ...))` caps
the error message length so a huge HTML error page (e.g. a Cloudflare block page) doesn't
get logged/thrown in full — defensive truncation, not a security control.

**What happens if the model returns malformed JSON (e.g. adds commentary before the
JSON, or the JSON is truncated because `maxOutputTokens` was hit)?**
`parseJsonResponse()` only defends against markdown code fences
(` ```json ... ``` `) — it does **not** handle truncated/malformed JSON beyond that. A
genuinely broken response would throw inside `objectMapper.readTree(cleaned)`, get caught
by the `catch (Exception e)` in `analyze()`, logged as a warning, and the chain moves to
the next model/provider. So the *system* is resilient (falls through to the next option),
but there's no repair/retry-with-corrected-prompt logic for a single malformed response —
a reasonable follow-up question to have an answer ready for: "I'd add a one-shot retry
that re-prompts with 'your last response was invalid JSON, return only valid JSON' before
falling through to the next provider."

**Why `maxOutputTokens: 4000` and `temperature: 0.3`?**
Low temperature (0.3, not the default ~1.0) trades creativity for consistency/determinism
— this is a structured-data extraction task (fill a fixed JSON schema), not creative
writing, so you want the model to reliably follow the schema rather than vary its style
each call. 4000 tokens caps cost and latency per request while still fitting the fairly
large schema (summary + 3 explanation tiers + 3 solution approaches with code + arrays of
tips/mistakes/edge cases/flashcards).

**Is there caching? What does `fromCache` on the DTO actually do right now?**
`AIAnalysisDTO.fromCache` is set to `false` on every path (`parseJsonResponse` and the
static fallback both hard-code `.fromCache(false)`) — it's a field that exists for a
caching layer that **isn't implemented yet**. Good honest answer if probed: "the DTO
already has the field reserved for it, but today every request re-calls the AI provider
even for a problem that's been analyzed before by someone else — that's the single biggest
cost/latency win available, and I'd add it with Redis keyed on `problemId` (+ maybe
`modelUsed`) with a long TTL since a DSA problem's optimal solution doesn't change."

**The controller (`AIController`) is a single `GET /analyze/{problemId}` endpoint with no
request body and no auth. Any concerns with that as a design?**
Two worth naming yourself before an interviewer does:
1. **GET for a non-idempotent, costly operation.** Every call can trigger a real,
   metered external API call (money + quota) and isn't cached — semantically this behaves
   more like a `POST`/command than an idempotent `GET` resource fetch. It's public and
   free of side effects on your own data model, so `GET` isn't *wrong*, but it does mean
   the endpoint has no natural request-body extension point (e.g. "re-analyze with a
   different model") and browsers/proxies may prefetch or cache a GET more aggressively.
2. **No rate limiting / no auth on an endpoint that spends API quota.** Since it's
   `permitAll()` in `SecurityConfig`, anyone who finds the URL can burn through your
   Gemini/OpenAI/Claude quota by hitting different `problemId`s repeatedly. Pairing this
   with the caching layer above (so repeat calls for the same problem are free) plus
   basic rate limiting (e.g. bucket4j or a simple per-IP counter) would close that gap.

**Why is `AIAnalysisDTO.SolutionApproach` a nested static class instead of a top-level
DTO?**
It's only ever used inside `AIAnalysisDTO` (three fields: `bruteForce`, `betterApproach`,
`optimalApproach`, all the same shape: name/idea/complexity/pseudocode/code) — nesting it
communicates "this type has no meaning outside its parent" without needing a separate
file, and Lombok's `@Builder`/`@Data` work identically on nested static classes.

**Why three solution tiers (brute force → better → optimal) instead of just "the
answer"?**
This mirrors how a real DSA interview is actually run — candidates are expected to state a
brute force first, then iteratively optimize, explaining the reasoning between each step
(that's literally what `interviewTips` and the tiered `easyExplanation` /
`mediumExplanation` / `advancedExplanation` fields are for). It's a product decision that
reflects the interview process itself, not just "give me code" — good to frame this as
you understanding the *domain*, not just the tech stack, if asked why you designed the
schema this way.

**Is there a risk of prompt injection here, and does it matter?**
The prompt splices in `problem.getTitle()`, `problem.getDescription()`, and
`problem.getTopics()` — all of which originate from LeetCode's own GraphQL API via
`LeetCodeFetchService`, not directly from a user-supplied request field. So the realistic
injection surface is "could a malicious LeetCode problem description manipulate the
prompt," which is low-value/low-likelihood since you don't control LeetCode's content and
the worst case is a garbled analysis for one problem, not a security breach — there's no
user-controlled input reaching this prompt today. Worth noting *if* a future feature let
users submit custom problems/descriptions, this input would need sanitizing before being
concatenated into the prompt.

---

## 3. Data ingestion (LeetCode + Company data)

**How does the daily challenge get fetched automatically?**
`DailyChallengeScheduler` has three triggers:
- `@EventListener(ApplicationReadyEvent.class)` — fetch immediately on app startup so the
  feature works without waiting for midnight.
- `@Scheduled(cron="0 30 18 * * ?", zone="UTC")` — 18:30 UTC = 00:00 IST, 30 min after
  LeetCode's own midnight-UTC reset, to avoid a race with their data.
- A second scheduled job at 19:30 UTC as a **safety retry** in case the first one failed
  (network blip, LeetCode API down).

This is a good spot to talk about idempotency/resilience in scheduled jobs — the retry job
just re-runs `fetchAndSaveTodaysChallenge()`, which presumably checks "do I already have
today's challenge" before writing (worth double-checking that method if asked to go
deeper).

**How is company data loaded?**
`CompanyDataLoaderService` runs `@Async` on `ApplicationReadyEvent` so it doesn't block
startup, hits raw GitHub CSV URLs for ~18 companies × 5 timeframes (all / 6mo / 3mo / 30d /
>6mo), and is idempotent — `countByCompanyAndTimeframe()` skips a combination that's
already loaded, so restarting the app doesn't duplicate data. There's also a manual
`POST /reload/{company}` endpoint for on-demand refresh.

**Why GET on `/company-problems` is public but POST (tick-mark) presumably isn't:**
Reading the problem list needs no auth (public data), but marking a problem as "solved" is
tied to a specific user's progress — that mutation requires a JWT so progress is written
against the authenticated user, not anonymously.

### 3a. GitHub CSV ingestion — deeper dive

**Where does the company-wise problem data actually come from, and how is the URL
built?**
It's a plain **GET over raw.githubusercontent.com** — no GitHub API, no auth token, no
rate-limit concerns from GitHub's side (raw file serving isn't subject to the API's
60-req/hr unauthenticated limit). The URL is built by string concatenation:
```java
private static final String BASE_URL =
    "https://raw.githubusercontent.com/Shivanshu-23/leetcode-companywise-interview-questions/master/";
...
String csvUrl = BASE_URL + company + "/" + timeframe + ".csv";
```
So for `company="amazon"`, `timeframe="thirty-days"`, the actual URL hit is:
`https://raw.githubusercontent.com/Shivanshu-23/leetcode-companywise-interview-questions/master/amazon/thirty-days.csv`
— i.e. the repo is laid out as one CSV file per company/timeframe combination
(`{company}/{timeframe}.csv`), and the loader just iterates every combination of the 18
hardcoded companies × 5 hardcoded timeframes and requests each file directly.

**Walk through the actual HTTP fetch (`fetchUrl()`).**
```java
HttpURLConnection conn = (HttpURLConnection) url.openConnection();
conn.setRequestMethod("GET");
conn.setRequestProperty("User-Agent", "CP-Mentor/1.0");
conn.setConnectTimeout(10000);
conn.setReadTimeout(15000);

int code = conn.getResponseCode();
if (code == 404) return null;
if (code != 200) throw new RuntimeException("HTTP " + code + " for " + urlStr);
```
- A `User-Agent` header is set explicitly — some CDNs/GitHub infra reject or throttle
  requests with no `User-Agent`, so this is defensive, not optional.
- **404 is treated as a distinct, non-error outcome** (`return null`), not an exception —
  because not every company necessarily has every timeframe file in the source repo (e.g.
  a newer/smaller company might not have a `more-than-six-months.csv`). A missing file is
  an expected "this combination doesn't exist," not a failure.
- Any other non-200 (500, 503, rate-limited, etc.) *is* thrown as an exception, since
  that's an actual fetch failure worth logging.
- The body is streamed with a `BufferedReader` line-by-line into a `StringBuilder` rather
  than reading the whole `InputStream` into a byte array at once — negligible difference
  at this file size, but the idiomatic Java pattern for line-oriented text.

**How is the CSV actually parsed, and what's fragile about it?**
```java
String[] parts = line.split(",", 6);
```
Splits on comma with a **limit of 6** (not unlimited) — this caps the split to exactly 6
fields (`id, url, title, difficulty, acceptance, frequency`), so if the `title` column
itself contains a comma (e.g. `"Two Sum, Revisited"`), everything past the 5th comma gets
absorbed into the last field (`frequency`) rather than shifting every subsequent column.
It's a naive but pragmatic parser — it is **not** a real CSV parser (no quoted-field
handling, no escaped commas *inside* an early field like `title` before the split limit
kicks in). If `title` contains a comma before the difficulty/acceptance/frequency columns,
this would misalign the row. Good to have this answer ready if asked "what's a limitation
of this ingestion code": *"it's a manual comma-split, not a proper CSV parser like Apache
Commons CSV or OpenCSV — it works for this particular dataset's format but wouldn't be
robust against arbitrary CSV escaping rules."*
Beyond the split, it also defends against header rows and junk lines:
```java
if (leetcodeId.equalsIgnoreCase("id") || !leetcodeId.matches("\\d+")) continue;
```
skips a literal `"id"` header row and anything where the first column isn't purely
numeric — cheap validation that a line is actually a data row before trying to use it.

**Why `@Async` + `@EventListener(ApplicationReadyEvent.class)` together, specifically?**
`ApplicationReadyEvent` fires once the whole Spring context is up and the app is actually
ready to serve traffic (later than `@PostConstruct`, which can run before other beans/the
web server are fully initialized). `@Async` then offloads `loadOnStartup()` onto a
separate thread pool so the ~90 sequential HTTP calls (18 companies × 5 timeframes) don't
block application startup — without it, the app wouldn't finish booting (and wouldn't
accept any requests, including totally unrelated ones like login) until all 90 GitHub
fetches completed one by one.

**Is the fetch loop concurrent or sequential? Does that matter?**
It's **sequential** — a plain nested `for` loop over companies then timeframes, each
`loadCompanyTimeframe()` call blocking on its own `HttpURLConnection` before the next
starts. `@Async` only moves the *whole loop* off the main startup thread; it doesn't
parallelize the individual requests within it. With ~90 combinations at up to ~15s read
timeout each in the worst case, a string of slow/failing requests could take a while to
finish in the background — acceptable since it's non-blocking for the app itself, but a
real optimization opportunity: firing these concurrently (e.g. with a bounded thread pool
or `CompletableFuture.allOf(...)`) would cut total load time significantly. Good answer
if asked "how would you speed this up."

**How does one failing company/timeframe not take down the whole load?**
Each iteration is wrapped individually:
```java
for (String company : COMPANIES) {
    for (String timeframe : TIMEFRAMES) {
        try {
            total += loadCompanyTimeframe(company, timeframe);
        } catch (Exception e) {
            log.debug("Skipping {}/{}: {}", company, timeframe, e.getMessage());
        }
    }
}
```
Per-combination try/catch means one bad fetch (timeout, malformed CSV, GitHub hiccup)
only skips that single company/timeframe pair — the loop continues to the next one rather
than aborting the entire startup load. This is the same "isolate failure at the smallest
useful unit" pattern as the AI provider fallback chain (§2) and the retry-safe daily
scheduler (above) — a recurring theme across this codebase worth naming explicitly if an
interviewer asks about your general approach to resilience: fail small, fail isolated,
keep going.

**Why check `existsByLeetcodeIdAndCompanyAndTimeframe` per-row inside `parseCsv`, when
`loadCompanyTimeframe` already skips the whole file if `countByCompanyAndTimeframe > 0`?**
The file-level check (`countByCompanyAndTimeframe(company, timeframe) > 0`) is the cheap
fast-path: if this company/timeframe was already loaded in full, skip the entire fetch and
parse. The row-level check inside `parseCsv` is a second, finer-grained safety net for
partial/duplicate scenarios that same-file check wouldn't catch — e.g. it protects against
double-inserting if the loader were ever re-triggered mid-way (like via the manual
`POST /reload/{company}` endpoint after some rows already exist for that exact
company/timeframe from an earlier partial load). Slightly redundant in the common case,
but a reasonable defensive layer for the reload/retry paths.

**How does the manual "reload" endpoint differ from the startup load?**
`POST /api/v1/company-problems/reload/{company}` calls `CompanyDataLoaderService
.reloadCompany(company)`, which loops the 5 timeframes for **just that one company**,
synchronously (no `@Async` here — it's a direct request/response HTTP call, so the caller
gets the actual `loaded` count back immediately). It reuses the exact same
`loadCompanyTimeframe()` method as startup, so the same idempotency/skip-if-exists
behavior applies — meaning today, calling reload on a company that's already loaded is a
no-op (0 loaded) unless the underlying rows were deleted first. That's the mechanism the
README's "BUG 2" workaround for stale/old company lists actually relies on.

### 3b. LeetCode daily challenge fetch — deeper dive

**Quick summary — "how are questions fetched?" (recite this first, then go deeper if
asked to elaborate):**

1. **What triggers a fetch** (`DailyChallengeScheduler`)
   - On app startup (`ApplicationReadyEvent`) — works immediately without waiting for
     midnight.
   - Every day at 18:30 UTC / 00:00 IST (cron `"0 30 18 * * ?"`) — 30 min after LeetCode
     resets its daily challenge at midnight UTC.
   - A safety-retry cron at 19:30 UTC in case the first one failed.

2. **Idempotency check first** (`LeetCodeFetchService.fetchAndSaveTodaysChallenge()`)
   ```java
   if (dailyChallengeRepository.existsByChallengeDate(today)) {
       return dailyChallengeRepository.findByChallengeDate(today).orElseThrow();
   }
   ```
   If today's challenge is already saved, return it immediately — no network call. Makes
   it safe to trigger the fetch 2-3 times a day without duplicating work.

3. **The actual fetch** (`fetchFromLeetCode()`)
   - POSTs a hardcoded GraphQL query to `https://leetcode.com/graphql` asking for
     `activeDailyCodingChallengeQuestion` (id, title, slug, difficulty, `content` HTML,
     topic tags, example test cases).
   - Spoofs browser headers (`User-Agent`, `Referer`, `Origin`) since it's LeetCode's
     internal/unofficial endpoint.
   - Checks HTTP status, then checks for a GraphQL-level `"errors"` field even inside a
     200 response.

4. **Parsing the response** (`parseAndSave()`)
   - Pulls structured fields straight out of the JSON (id, title, difficulty, topics).
   - `content` is raw HTML — `constraints` and the first example's `output` aren't
     separate GraphQL fields, so they're scraped out of that HTML with regex
     (`stripHtml`, `extractConstraints`, `extractFirstExampleOutput`).
   - Upserts the `Problem` by `leetcodeId` (update if it already exists, insert if new)
     so a recurring daily-challenge problem doesn't create duplicate rows.
   - Saves a new `DailyChallenge` row linking that `Problem` to today's date.

5. **If the fetch fails at any point** (`useFallback()`) — never surfaces an error to the
   user, degrades gracefully instead:
   - First tries reusing the most recent previous daily challenge's problem, stamped with
     today's date.
   - If there's no history at all, falls back to any problem already seeded in the DB
     (`DataInitializer`'s 3 seed problems).

*(Company-wise problems for the tracker are fetched completely differently — not
GraphQL, just plain CSV files pulled via HTTP GET from
`raw.githubusercontent.com/.../{company}/{timeframe}.csv`; see §3a for that flow.)*

---

**What API does LeetCode actually expose, and how is it queried?**
LeetCode doesn't have an official public REST API — this hits their **internal GraphQL
endpoint** (`https://leetcode.com/graphql`, the same one their own website's frontend
uses) with a hand-written query string:
```java
private static final String QUERY =
    "{\"query\":\"query questionOfToday { activeDailyCodingChallengeQuestion { date link question { questionId questionFrontendId title titleSlug difficulty content topicTags { name } exampleTestcases } } }\"}";
```
It's a raw JSON string, not built via a GraphQL client library — for a single fixed query
with no variables, a full GraphQL client would be overkill; a POST body constant is simpler
and has zero extra dependencies.

**Why does the request spoof a browser User-Agent, Referer, and Origin?**
```java
conn.setRequestProperty("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36");
conn.setRequestProperty("Referer", "https://leetcode.com/");
conn.setRequestProperty("Origin", "https://leetcode.com");
```
LeetCode's GraphQL endpoint isn't published as a public API for third parties to call
directly — it's meant to be hit *from* leetcode.com by their own frontend. Requests that
look like they're coming from a generic HTTP client/bot (default Java `User-Agent`, no
`Referer`/`Origin`) are more likely to be blocked or rate-limited by their edge/WAF layer.
Setting these headers makes the server-side request resemble a real browser session. Worth
being upfront about this if asked: it's scraping an undocumented endpoint, which is
inherently fragile — LeetCode could change the schema or block this pattern at any time,
which is exactly why the multi-layer fallback (below) exists.

**Why does `QuestionNode` not have a `constraints` field in the query, and where do
constraints actually come from?**
LeetCode's GraphQL schema doesn't expose problem constraints as a separate structured
field — they're embedded inside the `content` field, which is a big blob of **raw HTML**
(the same HTML LeetCode renders as the problem statement on their site). So this service
does its own lightweight HTML scraping on top of the GraphQL response:
- `stripHtml()` — regex-strips tags, unescapes HTML entities (`&lt;`, `&amp;`, `&nbsp;`,
  etc.), and specifically converts `<sup>...</sup>` into a `^` character **before** the
  generic tag-strip runs — because exponents like `10^5` are literally rendered as
  `10<sup>5</sup>` in LeetCode's HTML, and stripping tags naively first would just delete
  the `5` along with the tag, silently corrupting constraint numbers. That's a genuinely
  subtle bug you had to catch and fix — good one to describe if asked about a tricky
  parsing bug.
- `extractConstraints()` — finds the `"Constraints"` heading by text search, then locates
  the next `<ul>...</ul>` block after it and regex-matches each `<li>` item out
  individually, joining them into a bullet list.
- `extractFirstExampleOutput()` — the GraphQL `exampleTestcases` field only gives raw
  **inputs**, not the matching expected output, so the output for the first example has to
  be scraped separately: find the first `<pre>` block in `content`, strip its HTML, then
  text-search for `"Output:"` and cut the string there (stopping early if an
  `"Explanation:"` label follows, so that explanatory text doesn't get glued onto the
  output value).

This whole chain is a good talking point: **the fetch problem isn't "call an API," it's
"reverse-engineer an unofficial API's undocumented HTML-embedded data shape and parse it
defensively."** None of `stripHtml`/`extractConstraints`/`extractFirstExampleOutput` use a
real HTML parser (like Jsoup) — they're all regex/`indexOf`-based, which is fragile against
any change in LeetCode's markup structure but avoids adding an HTML-parsing dependency for
what's ultimately a narrow, known input shape.

**What's the full fallback chain if the LeetCode fetch fails, layer by layer?**
1. **Idempotency check first, before any network call**: `existsByChallengeDate(today)` —
   if today's challenge is already saved, return it immediately, no HTTP call at all. This
   is what makes it safe for the scheduler to call `fetchAndSaveTodaysChallenge()` up to
   three times a day (startup + 2 cron jobs) without triple-fetching or triple-inserting.
2. **Try the live GraphQL fetch** (`fetchFromLeetCode`) — checks HTTP status, then checks
   for a GraphQL-level `"errors"` field even on a 200 (same "error can hide inside a
   successful response" pattern as the Gemini integration in §2a), then parses.
3. **If that throws for any reason** (network failure, LeetCode blocking the request,
   schema change breaking the parse), `useFallback(today)` kicks in:
   a. First choice: re-use **yesterday's** (or whatever the most recent) daily challenge's
      `Problem`, just stamped with today's date —
      `findFirstByOrderByChallengeDateDesc()`.
   b. Last resort, if there's no daily-challenge history at all (e.g. very first run and
      the live fetch also failed): fall back to **any** problem already seeded in the DB
      (`problemRepository.findAll().stream().findFirst()`), from `DataInitializer`'s 3
      seeded problems.
   This means the "daily challenge" feature can **never** return a hard error to the user
   — worst case, they see a repeated or seeded problem instead of today's real LeetCode
   problem, which is a much better failure mode than a broken page. Same design philosophy
   as the AI service's static concept fallback (§2) and the company-loader's
   isolate-and-continue pattern (§3a) — a consistent theme across this codebase you can
   point to as "graceful degradation" if asked about your general design philosophy.

**How does saving a `Problem` avoid creating duplicates on re-fetch?**
```java
Problem problem = problemRepository.findByLeetcodeId(leetcodeId).orElseGet(() -> Problem.builder()...build());
problem.setTitle(title);
...
problem = problemRepository.save(problem);
```
This is a manual **upsert**: look up by the unique `leetcodeId` column first; if found,
mutate the existing managed entity's fields (title, difficulty, topics, and — only if
non-blank — description/constraints/exampleOutput) and save (JPA does an `UPDATE`); if not
found, build a brand-new entity (JPA does an `INSERT` once `save()` is called, since it has
no `id` yet). This means if the same problem is ever selected as the daily challenge again
on a different date, its `Problem` row is refreshed/reused rather than duplicated — and the
`content`/`constraints`/`exampleOutput` fields are only overwritten when the newly-parsed
value is non-blank, so a parsing hiccup that produces an empty string doesn't wipe out
previously-good data.

**Why `if (!content.isBlank()) problem.setDescription(content)` instead of always
setting it?**
Defensive against the HTML-scraping fragility described above — if `stripHtml`/parsing
ever returns an empty string for a field (e.g. LeetCode changes their markup and the regex
stops matching), this guard means the existing DB value for that field is preserved
instead of getting silently blanked out. Small detail, but it's directly related to the
"regex-based parsing is fragile" trade-off above — this is the mitigation for it.

**What's the relationship between `DailyChallenge` and `Problem`, and why
`FetchType.EAGER`?**
```java
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "problem_id", nullable = false)
private Problem problem;
```
Many `DailyChallenge` rows (one per date) can point to the same `Problem` (a problem can
recur as the daily challenge, or get reused via the fallback path above) — classic
`@ManyToOne`. `EAGER` fetch means whenever a `DailyChallenge` is loaded, its `Problem` is
loaded in the same query (a JOIN) rather than lazily on first access — reasonable here
since `DailyChallengeController.getStatus()`/`triggerFetch()` always immediately access
`dc.getProblem().getTitle()`/`getDifficulty()` right after loading, so lazy-loading would
just mean an extra round-trip query anyway (or a `LazyInitializationException` if accessed
outside a transaction, which is a very common Spring Data JPA gotcha worth knowing how to
explain — happens when a lazy field is accessed after the Hibernate session/transaction
that loaded the parent entity has already closed).

**Why is `Problem.topics` an `@ElementCollection` instead of its own entity/table with a
foreign key?**
```java
@ElementCollection(fetch = FetchType.EAGER)
@CollectionTable(name = "problem_topics", joinColumns = @JoinColumn(name = "problem_id"))
@Column(name = "topic")
private List<String> topics;
```
Topics (`"Array"`, `"Hash Table"`, etc.) are just plain strings with no identity or
behavior of their own — no reason to model them as a full JPA `@Entity` with its own
repository. `@ElementCollection` gives you a simple `problem_topics(problem_id, topic)`
join table under the hood without the ceremony of a real entity class, which is the right
call whenever the "child" data has no independent existence apart from its parent (compare
to `CompanyProblem`/`UserProblemProgress` in §7, which *are* full entities because they
have their own identity, columns, and lifecycle).

**Explain the two endpoints on `DailyChallengeController` and why one returns a 503.**
- `GET /status` — read-only, never triggers a fetch; just reports whether today's row
  exists yet, with a hint message telling the caller how to trigger one if not. Cheap,
  side-effect-free, safe to poll.
- `POST /fetch` — manually triggers `fetchAndSaveTodaysChallenge()` on demand (used for
  debugging/manual refresh outside the scheduled times). On failure it returns **503
  Service Unavailable**, not 500 — a deliberate, meaningful status code choice: 503 signals
  "the upstream dependency (LeetCode) is the problem, this server is otherwise fine and the
  seeded/fallback data is still available," versus a 500 which would suggest a bug in this
  server's own logic. The response body even says so explicitly: `"hint": "LeetCode API
  may be rate-limiting. Seeded problems are still available via GET /api/v1/problems/daily"`
  — good example of an error response designed to be actually useful to whoever's debugging
  it, not just a stack trace.

---

## 4. Frontend architecture (Angular 17)

- **Interceptor pattern** for auth (shown above) — cross-cutting concern (attaching the
  token) kept out of every component/service that makes HTTP calls.
- **Guards** (`auth.guard.ts`) protect routes that need login (e.g. anything writing
  progress) client-side, while the backend is still the real enforcement point —
  client-side guards are UX, not security.
- **Angular Material** for the dark-themed UI; feature-module folder structure (`home`,
  `analysis`, `company-tracker`, `login`, `register`) separating each screen's
  component/service/template.
- Talking point if asked about frontend security: JWT in `localStorage` is vulnerable to
  XSS (vs. an httpOnly cookie) — a reasonable trade-off for a side project, but worth
  naming as a known limitation if the interviewer probes on security best practices.

---

## 5. Database & design decisions

- **MySQL 8 + Flyway** for `dev`/`prod` (H2 was the original dev-only choice — since
  productionized). Hibernate's `ddl-auto` is `validate`, never `create`/`update` — the
  schema is owned entirely by versioned migrations in `src/main/resources/db/migration/`.
  `test` profile still uses in-memory H2 (`ddl-auto: create-drop`, Flyway disabled) so unit
  tests need no external DB. Good "how would you productionize this" answer that's now a
  "here's how I actually did it" answer instead.
- **Production database is Aiven's free-tier managed MySQL**, fronted by a Render free-tier
  web service and a Vercel-hosted Angular frontend — the whole stack runs on free infra.
  Real trade-off worth naming proactively: Aiven's free tier auto-powers-off the database
  during inactivity, and Render's free web service cold-starts in 60-140s after idling.
  Both are things you'd pay to eliminate on a real production budget; see "Production
  operations" below for the actual incident this caused and how it was diagnosed.
- **DTO pattern** everywhere (`AIAnalysisDTO`, `ProblemDTO`, `CompanyProblemDTO`) —
  entities never leak directly to the API layer, so you can change the JPA schema without
  breaking the contract.
- **GlobalExceptionHandler** (`@ControllerAdvice`) centralizes error responses instead of
  try/catch scattered across controllers — also has a dedicated
  `@ExceptionHandler(ResponseStatusException.class)`, added after discovering the catch-all
  `Exception.class` handler was swallowing 404s into 500s (a real bug, good "gotcha" story,
  see below).
- **Every table needs an explicit primary key**, including `@ElementCollection` join
  tables — managed MySQL (Aiven included) runs with `sql_require_primary_key=ON` for
  replication safety, and a table with only a foreign key + value column fails at
  migration time with MySQL error 3750. This only surfaces against a *real* managed MySQL
  instance — local Docker MySQL and H2 don't enforce it, so it silently doesn't show up
  until an actual deploy. Good example of "a bug that only exists in production" if asked.

---

## Likely "gotcha" / debugging questions and how to answer them

**"Tell me about a bug you had to debug."** Use the Gemini API key issue — you learned
Gemini expects the key in an `X-goog-api-key` **header**, not a `?key=` query param
(common mistake copying REST conventions from other providers), and that
quota-exhaustion errors (429/RESOURCE_EXHAUSTED) are account-level, so you added
`isAccountLevelError()` to fail fast across all 3 Gemini model variants instead of wasting
3x the timeout on a dead key.

**"How would you scale this?"** Stateless JWT auth already scales horizontally with no
sticky sessions; add Redis for AI-response caching (same problem analyzed by many users
shouldn't hit Gemini every time) and for company-data caching; move off H2 to MySQL with
connection pooling; the `@Async` company loader and scheduled daily-fetch already keep
expensive I/O off the request path.

**"Why three AI providers instead of one?"** Reliability and cost — free-tier Gemini quota
runs out fast (learned this firsthand), so a fallback chain means one exhausted key
doesn't take down the whole feature, and the static fallback means the feature literally
cannot fully fail.

---

## 7. Company Tracker — deeper dive

**What's the data model? Walk through the two entities.**
- `CompanyProblem` — the catalog: `leetcodeId`, `url`, `title`, `difficulty`, `company`,
  `timeframe`, `acceptanceRate`, `frequency`. Has a **composite unique constraint** on
  `(leetcode_id, company, timeframe)` — the same LeetCode problem legitimately appears
  once per company *per timeframe bucket* (e.g. Amazon/all vs Amazon/thirty-days are
  different rows), so the uniqueness has to be scoped to all three columns, not just the
  problem ID.
- `UserProblemProgress` — per-user state: `userEmail`, `leetcodeId`, `tickCount` (0-3),
  `lastUpdated`. Also has a composite unique constraint, on `(user_email, leetcode_id)` —
  one progress row per user per problem, regardless of which company/timeframe list it was
  viewed from (a problem solved via Amazon's list is also solved if it shows up under
  Google's list — progress is problem-scoped, not company-scoped). This is a deliberate
  normalization choice: progress isn't duplicated per company, so ticking "Two Sum" once
  marks it solved everywhere it appears.

**Why is the field called `userEmail` when the JWT subject is called "username"?**
This one's a genuine gotcha worth explaining confidently: `CustomUserDetailsService.
loadUserByUsername(String email)` looks the user up **by email**, so Spring Security's
notion of "username" throughout this app is actually the user's email address end-to-end
— `JwtUtil` puts the email in the JWT `subject`, and every controller does
`user.getUsername()` to get it back out. `UserProblemProgress.userEmail` is just naming
that reflects what the value actually *is*, even though it flows through Spring Security's
generically-named `getUsername()` accessor. Good example of "the type/method name is
generic, but the domain meaning is specific" — worth being able to trace that chain if
asked.

**Explain the tick-mark cycle. Why 0-3 instead of a boolean?**
```java
int newTick = (progress.getTickCount() + 1) % 4;
```
Modulo-4 cycling: `0 (not started) → 1 (seen) → 2 (attempted) → 3 (solved) → back to 0`.
A boolean (solved/not solved) can't represent "I looked at this but haven't tried it" vs
"I attempted it but didn't finish" — the 4-state model captures the actual stages of
working through a DSA problem, which is more useful for a study tracker than a binary
checkbox. `POST /{leetcodeId}/tick` has no request body — it's a pure "advance the state
machine by one" command, which keeps the API dead simple (no need to validate an arbitrary
tick value from the client).

**How does the "get problems with progress" query avoid N+1?**
`getProblems()` in `CompanyProblemService` first pages `CompanyProblem` rows (a normal
paginated JPA query), then does **one batch query** for progress:
```java
progressRepository.findByUserEmailAndLeetcodeIdIn(userEmail, leetcodeIds)
```
— collects all `leetcodeId`s on the current page into a list and fetches all matching
progress rows in a single `WHERE leetcode_id IN (...)` query, builds a `Map<leetcodeId,
tickCount>` in memory, then maps each `CompanyProblem` to a DTO with
`progressMap.getOrDefault(id, 0)`. The alternative — querying progress per-problem inside
the page-mapping loop — would be a classic N+1 (1 query for the page + N queries for
progress, one per row). This is the right pattern to describe if asked "how do you avoid
N+1 in JPA" generally: batch the second lookup with `IN`, join in memory.

**Why is `GET /company-problems` public but still personalizes results for logged-in
users?**
```java
@GetMapping
public ResponseEntity<Page<CompanyProblemDTO>> getProblems(..., @AuthenticationPrincipal UserDetails user) {
    String email = user != null ? user.getUsername() : null;
    ...
}
```
`@AuthenticationPrincipal` resolves to `null` if there's no valid JWT (since the endpoint
is `permitAll()` — `JwtAuthFilter` only populates `SecurityContextHolder` when a valid
token is present, it doesn't reject the request when absent). So the same endpoint serves
two audiences: anonymous visitors get the raw problem list with `tickCount: 0` for
everything, and logged-in users transparently get their real progress merged in — no
separate "authenticated" endpoint needed. `getProblems()` short-circuits to an empty
`Map.of()` when `userEmail == null` so it doesn't run the progress query at all for
anonymous traffic.

**Why do `/tick` and `/stats` manually return 401 (`user == null`) instead of relying on
`SecurityConfig`?**
Because those two routes are **not** in the public `permitAll()` list (only `GET` on
`/company-problems/**` is public) — so in practice a request without a valid JWT would
already be rejected by Spring Security itself with a 401/403 before it reaches the
controller method. The `if (user == null)` checks in the controller are defensive
belt-and-suspenders (or leftover from before the security rule was tightened) — a good
one to flag if an interviewer asks "is this dead code / redundant," since it shows you can
read a security config and a controller together and spot where enforcement actually
happens vs. where it's merely duplicated.

**How does the frontend keep the UI responsive when ticking a problem?**
`CompanyTrackerComponent.tick()` does an **optimistic update**:
```ts
const oldTick = problem.tickCount;
problem.tickCount = (problem.tickCount + 1) % 4;   // update UI immediately
this.http.post(...).subscribe({
  next: res => { problem.tickCount = res.tickCount; ... },
  error: () => { problem.tickCount = oldTick; ... }  // revert on failure
});
```
The UI mutates local state immediately (before the network call resolves) so the tick
icon flips instantly on click instead of waiting on a round trip, then reconciles with the
server's actual response — and rolls back to `oldTick` if the request fails, with a snack
bar telling the user it didn't save. This is the standard optimistic-UI pattern: assume
success, correct on failure. Worth naming the risk: if the network is slow and the user
clicks rapidly, the client-side state could briefly disagree with the server's actual
state until each response lands — acceptable here since each tick is idempotent-ish
(worst case, one extra click gets corrected on the next reconcile).

**Why does `loadCompanies()` fall back to a hardcoded `defaultCompanies()` list on
error?**
Same resilience philosophy as the AI fallback chain: if `/company-problems/companies`
fails (network blip, backend restarting), the dropdown still populates with the known
18-company list baked into the component rather than showing an empty/broken filter —
degrade gracefully instead of leaving the UI unusable.

**Why is search (`filteredProblems`) done client-side instead of a backend query
param?**
```ts
get filteredProblems(): CompanyProblem[] {
  const term = this.searchTerm.trim().toLowerCase();
  return this.problems.filter(p => p.title.toLowerCase().includes(term));
}
```
It only filters the **current page** already loaded into memory (up to `pageSize=50`
rows) — cheap to do client-side with an Angular getter, no extra HTTP round trip per
keystroke. Trade-off worth naming: this means search only searches the current page, not
the full company/timeframe result set — if asked "how would you make search work across
all pages," the answer is moving it server-side as a query param with its own
`findByCompanyAndTimeframeAndTitleContaining`-style repository method.

**What would you change about the CSV ingestion → entity → DTO pipeline if you had more
time?**
Good places to have answers ready:
- **Caching/rate limiting** — same gap as the AI service; company data barely changes, so
  it's a strong Redis-caching candidate.
- **Bulk upsert instead of skip-if-exists** — `loadCompanyTimeframe()` currently skips a
  company/timeframe combo entirely if any rows already exist, so a source CSV update on
  GitHub (frequency % changes, new problems added) never gets picked up without a manual
  `/reload/{company}` call — no automatic refresh/diffing.
- **Validation** — CSV parsing (`parts.length < 4`, `leetcodeId.matches("\\d+")`) silently
  skips malformed lines with a debug log; fine for a side project, but a production system
  would want that surfaced as a metric/alert rather than silently dropped.

---

## 6. Angular-specific questions

**Is this app using NgModules or standalone components?**
Both, deliberately split by role. `app.module.ts` is now a thin root `@NgModule` that
declares *only* `AppComponent` and imports the three Material modules the navbar shell
itself needs (`MatToolbarModule`/`MatButtonModule`/`MatIconModule`) plus two always-visible
standalone components (`CommandPaletteComponent`, `HelpOverlayComponent`). Every feature
route — Home, Login, Register, Pattern Library, Company Tracker, Solve Sessions, Recall
Drill, Progress Dashboard, etc. — is its own `standalone: true` component with an explicit,
audited `imports` array, wired in via `loadComponent: () => import(...)` in
`app-routing.module.ts` instead of a direct `component:` reference. This wasn't the
original design — it wasn't like this until a late optimization pass (see the Performance
section below) once the eagerly-bundled version was diagnosed as the cause of a mediocre
Lighthouse score. Good answer if asked "how would you improve this codebase" *before* that
work happened, and now doubles as a real "tell me about a refactor you did" story instead
of a hypothetical.

**Why import Material modules individually instead of one barrel module?**
Each `MatXModule` (toolbar, button, card, input, tabs, chips, select, table, paginator,
etc.) is imported separately. This keeps the bundle tree-shakeable — you only ship the
Material components you actually use instead of the whole library — at the cost of a
longer import list. Good to mention if asked about bundle size / performance.

**How does the HTTP interceptor get registered, and why `multi: true`?**
In `app.module.ts` providers:
```ts
{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
```
`HTTP_INTERCEPTORS` is a multi-provider token — `multi: true` tells Angular's DI to
**append** `AuthInterceptor` to the existing array of interceptors instead of replacing
it, since multiple interceptors can be registered and they run in a chain (each one calls
`next.handle()` to pass the request down the pipeline). Explain the interceptor's job:
clone the outgoing `HttpRequest` (requests are immutable) and attach `Authorization: Bearer
<token>` if a token exists.

**How is login state shared across the app reactively?**
`AuthService` keeps a `BehaviorSubject<boolean>` (`loggedIn$`), seeded with the current
`isLoggedIn()` value. `login()`/`register()` call `saveSession()` in a `tap()` side
effect, which pushes `.next(true)`; `logout()` pushes `.next(false)`. Components subscribe
via `isLoggedIn$()` (exposed as `.asObservable()` so consumers can't call `.next()` on it
directly — encapsulation). This is the standard RxJS pattern for sharing mutable UI state
across unrelated components without a full state-management library (NgRx would be the
next step at larger scale).

**Why `BehaviorSubject` instead of plain `Subject`?**
`BehaviorSubject` requires and holds an initial value, and immediately replays the *current*
value to any new subscriber. That matters here: if a component subscribes to
`isLoggedIn$()` after login already happened (e.g. a toolbar component created later in
the app's lifecycle), it still gets the current `true` state immediately instead of
waiting for the next `login()`/`logout()` call. A plain `Subject` would miss that.

**Explain the `tap()` operator's role in `login()`.**
`http.post(...).pipe(tap(res => this.saveSession(res)))` — `tap()` runs a side effect
(persisting the token to `localStorage` and updating `loggedIn$`) without transforming the
emitted value; the `AuthResponse` still flows through unchanged to whatever subscribes to
`login()` in the component (e.g. to navigate or show a success message). Contrast with
`map()`, which would transform the value itself.

**Why does `AuthGuard` implement `CanActivate` as a class instead of a functional guard?**
```ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  canActivate(): boolean { ... }
}
```
This is the pre-Angular-14 class-based guard API. Angular 14+ introduced functional guards
(`CanActivateFn`, a plain function) as the now-recommended, less-boilerplate approach —
another spot to mention as a modernization opportunity, alongside standalone components.
Functionally it's fine either way: `provideIn: 'root'` still tree-shakes it if unused, and
`Router` DI still works the same.

**What does `AuthGuard.canActivate()` actually protect against, and what doesn't it
protect against?**
It's purely a **client-side UX guard** — redirects to `/login` if `isLoggedIn()` is false
before a route even renders, so users don't see a broken page. It does **not** provide any
real security: a user could bypass it by editing localStorage or calling the API directly
with curl. The actual enforcement is server-side (`JwtAuthFilter` + `SecurityConfig`) —
good answer if asked "is this secure" or "what's the difference between a route guard and
real auth."

**Reactive Forms vs Template-driven Forms — which does this app use, and why?**
Both modules are imported (`ReactiveFormsModule`, `FormsModule`), but login/register
forms are the natural place Reactive Forms would be used — they give programmatic control
over validation state, easier unit testing (no DOM needed to test validators), and typed
form values, which matters for something like confirming password match or email format
before hitting the backend.

**How does the dev proxy work (`ng serve --proxy-config proxy.conf.json`)?**
Angular's dev server proxies API calls (e.g. `/api/v1/auth/login`) to the Spring Boot
backend on port 8080, so the frontend code can call relative paths (`this.API =
'/api/v1/auth'` in `AuthService`) without hardcoding `http://localhost:8080` — avoids CORS
issues in dev and means the same relative-path code works in production behind a reverse
proxy or the Vercel rewrite rule.

**Change detection — anything notable here?**
Standard Angular default (Zone.js-based) change detection is in play, nothing manually set
to `OnPush` based on what's in `app.module.ts`. If asked how you'd optimize a component
with a large table (e.g. the company-tracker's `MatTable`/`MatPaginator`), the answer is
`ChangeDetectionStrategy.OnPush` plus an `Observable`-driven template (`async` pipe)
instead of manually subscribing and mutating component fields — reduces unnecessary
re-renders on unrelated state changes.

**What's the role of `TiltDirective`?**
A custom attribute directive (`shared/tilt.directive.ts`) — a good prompt to explain
Angular's directive system generally: attribute directives modify the behavior/appearance
of an existing element (vs. structural directives like `*ngIf`/`*ngFor` which add/remove
elements from the DOM, or components which have their own template). Worth being able to
describe `HostListener`/`HostBinding` if asked how a tilt-on-hover effect would be
implemented.

---

## 8. Scaling & debugging at production scale

**"How would you debug this if it were failing for millions of users?"**

### General methodology (answer this first, then get specific)
1. **Where in the stack is it failing?** — client → CDN/LB → app instances → DB →
   external APIs. Check each layer's health/metrics before assuming it's "the app."
2. **Spike vs. gradual degradation?** — a spike suggests a specific trigger (deploy,
   traffic surge, a dependency going down); gradual degradation suggests a resource leak
   (connection pool exhaustion, memory leak, thread starvation).
3. **Correlate logs across the failure** — a request/trace ID threaded through every log
   line lets you follow one failing request across services instead of grepping blind.
4. **Check for cascading failure** — one slow dependency can block threads that then
   can't serve unrelated requests, so "everything is down" doesn't mean the root cause is
   everywhere.

### Where *this specific app* would actually break first at millions-of-users scale

**1. MySQL + Flyway (production) already clears the "can I run 2 replicas" bar** — H2 was
only ever the `test`-profile choice. HikariCP connection pooling is already in play by
default via Spring Boot's auto-configuration. The real scaling ceiling at millions-of-users
load isn't persistence anymore, it's the single free-tier Aiven MySQL instance itself (1
CPU / 1GB RAM on the plan this project actually runs on) — no read replicas on the free
tier, no horizontal scaling of the DB layer. Good answer if asked "what's the next
bottleneck after the app tier scales": move to a paid tier with read replicas, or introduce
a read-through cache (Redis, point 3 below) so most reads never hit MySQL at all.

**2. `AIService`'s synchronous blocking HTTP calls are the most dangerous cascading-failure
risk.** Every `/api/v1/ai/analyze/{id}` request can block a Tomcat request-handling thread
for up to 3×(8s+25s) if all three Gemini models are slow before even reaching
OpenAI/Claude, and there's no circuit breaker. Tomcat's thread pool is finite (~200 by
default) — enough slow/stuck AI requests exhausts it, and then **unrelated** endpoints
(login, daily challenge) can't get a thread either, even though their own dependencies are
completely healthy. That's the classic "one dependency's outage takes down the whole app"
failure mode.
- **Debugging signature to look for:** a thread dump (`jstack`) showing a wall of threads
  stuck in `AIService.analyzeWithGemini` / `HttpURLConnection.getInputStream()`.
- **Fix:** a circuit breaker (Resilience4j), isolating these external calls onto a
  dedicated bounded thread pool (or moving to `WebClient` + reactive) separate from the
  main request-handling pool, and — the biggest lever — caching AI analysis results so
  most requests never call Gemini at all (gap already flagged in §2a).

**3. No caching anywhere on hot paths.** Every AI-analyze call and every company-problems
page load re-hits the DB (or Gemini) even though the same problem's analysis or the same
company's list barely changes. At millions of users this means the DB and the paid AI APIs
absorb ~100% of traffic instead of maybe 1% (cache misses only) — Redis in front of both is
the single highest-leverage fix available.

**4. No rate limiting on public, cost-incurring endpoints.** `/api/v1/ai/analyze/{id}` and
`GET /company-problems` are both `permitAll()`. At scale (or from a single abusive script)
this burns Gemini/OpenAI/Claude quota and DB capacity with no throttle.
**Debugging tell:** quota-exhaustion errors (`RESOURCE_EXHAUSTED`) or connection-pool
saturation with no correlated growth in real user traffic — a sign it's abuse/scraping,
not legitimate load.

**5. `@Scheduled` cron jobs have no distributed lock.** `DailyChallengeScheduler` and
`CompanyDataLoaderService`'s startup loader would run on **every** replica if scaled
horizontally — 10 instances means 10 simultaneous LeetCode fetches and 10 simultaneous
90-URL GitHub CSV loads at once. Mostly harmless today because both are idempotent
(`existsByChallengeDate`, `countByCompanyAndTimeframe`), but it's wasted work and a real
race window right at the idempotency check. Fix: `ShedLock` or similar so only one
instance runs each scheduled job.

**6. Zero observability today.** SLF4J logging exists, but there's no metrics
(Micrometer/Prometheus), no distributed tracing, no APM. The honest answer if this were
actually failing right now: *"I couldn't tell you exactly where without adding
instrumentation first"* — naming that gap, and the specific tools you'd reach for
(per-endpoint latency/error-rate dashboards, health checks tied to DB/external-API status,
structured logs correlated by request ID), is a more credible answer than pretending you'd
`grep` production logs by hand at that scale.

### A concrete failure scenario worth being able to narrate
"Gemini's free tier hits quota mid-afternoon under real traffic. All AI-analyze requests
start taking the full Gemini timeout before falling through to OpenAI/Claude. Tomcat's
thread pool fills with requests stuck waiting on Gemini. Login and daily-challenge
requests — which share the same thread pool but touch nothing AI-related — start timing
out too, even though *their* dependencies are healthy. Users report 'the whole site is
down,' but the root cause is one external API's quota, three steps removed. A circuit
breaker on Gemini calls, plus isolating AI-service threads from the main pool, would have
contained the blast radius to just the AI feature instead of the whole app."

---

## 9. Practice Method — teaching a method, not just answers

This is the module that actually differentiates the app from "yet another LeetCode
tracker," and it's the richest source of *product-thinking* interview answers, not just
implementation ones.

**What problem is this module actually solving?**
Grinding hundreds of LeetCode problems teaches pattern memorization, not transferable
problem-solving skill — you recognize problem #1547 because you've seen it, not because
you have a repeatable process for novel problems. The Practice Method module encodes a
5-phase worksheet (constraints → restate & brute force → hand-solve → name the bottleneck
→ code) that forces the same structured *process* on every problem, so what you're
practicing is the process, not the answer key.

**Walk me through the solve session flow end-to-end.**
`POST /api/v1/method/sessions` creates a session for a `leetcodeId`. The frontend stepper
(`solve-session-worksheet.component.ts`) walks five phases with autosave via `PATCH`
per step. Phase 0 (constraints) is a **write-only gate** — the problem statement itself
isn't shown back to the user until constraints are locked in, which is the whole
pedagogical point enforced in the UI: you commit to reading constraints *before* you're
allowed to see the problem framed as a "solve me" puzzle. A live timer runs with a
difficulty-based cap (15/35/55 min for easy/medium/hard) and a non-blocking overrun
warning. `POST /sessions/{id}/complete` sets `endedAt` and computes `durationSeconds`.

**The one non-negotiable product rule: the app must never volunteer a full solution.**
Hints are strictly progressive and user-triggered — level 1 is a single observation with
no pattern named, level 2 names the pattern and why it fits, level 3 is pseudo-code with
no language syntax, level 4 is the full solution and requires an explicit second
confirmation click. This is enforced **server-side**, not just hidden in the UI: `HintService`
takes an explicit `level` parameter and structurally cannot return a higher level than
requested, and there's a unit test asserting a level-1 response contains no code block and
no literal pattern name. Good answer if asked "how do you enforce a business rule that a
determined user could try to bypass" — client-side hiding isn't enforcement, this is.

**Why is pattern identification and hint generation deliberately built *without* AI?**
`PatternIdentificationService` and `HintService` never call an LLM — pattern ID is literal
substring matching against each pattern's stored `recognitionTriggers`/`antiTriggers`, and
hints are built entirely from a pattern's own stored fields (its `intuition` text for level
2, a regex-de-Java-ified version of its `javaTemplate` for level 3, the verbatim template
for level 4). This was a deliberate trade-off, not a fallback: the whole project needs to
be hostable for free with zero API-cost risk (see BUG 3 in CLAUDE.md — Gemini quota
exhaustion is a live, recurring problem for the *other* AI-backed feature), so a
core-to-the-product feature couldn't be allowed to depend on a paid, rate-limited, often
down external API. **Known, accepted limitation**: pure keyword matching only works when a
pasted problem statement happens to literally contain a stored trigger phrase — classic
phrasing for a well-known problem sometimes doesn't, and degrades gracefully to a
frequency-based fallback rather than a wrong answer. Good "trade-off you made and would
defend" interview answer: reliability and cost-predictability over marginal accuracy on
an edge case.

**What's the spaced-repetition system, and why self-graded instead of AI-graded?**
`TriggerEntry` — the user logs a "trigger" (the surface phrase that should make them reach
for a pattern next time) plus what they missed. Review scheduling: stage 0 → +2 days,
stage 1 → +7 days, stage 2 → +21 days, stage 3 → retired; PASS advances a stage, FAIL
resets to 0, SKIPPED pushes the date +1 day without changing stage. The recall drill shows
only the problem title, asks the user to type the approach from memory, and *only reveals
the stored trigger after they submit* — self-grading is deliberate here, not a shortcut:
it's faster than round-tripping to an LLM for grading, and arguably more honest, since the
user is the only one who actually knows whether they really remembered it or just
recognized the reveal.

**What's the retention gamification design principle, and what did you deliberately *not*
build?**
"Reward retention, not volume" — the headline stat is recall streak (consecutive days
completing the due drill), not problems-solved, specifically because a problems-solved
counter rewards grinding, which is the exact failure mode the whole app exists to correct.
Pattern mastery is tiered (Learning → Familiar → Solid → Mastered) based on PASS count at
increasing review stages, not raw attempt count. Deliberately **not** built: XP points,
leaderboards against strangers, badges for volume, daily login streaks unrelated to actual
review — all of those optimize for engagement metrics that don't correlate with the thing
the app is trying to build (retained understanding). Good "how do you think about metrics
that can be gamed" answer.

---

## 10. Frontend-static content layer & server-side rendering

This is the most recent major architecture change, and a strong "diagnose a real
constraint, then design around it" story.

**What problem forced this, concretely?**
Two facts about the actual deployment: the frontend was a pure client-side-rendered Angular
SPA (blank page until the JS bundle finishes downloading and booting), and the backend
free-tier host cold-starts in 60-140 seconds after being idle. Combine those and a
first-time visitor hitting the reference/teaching pages (the pattern library, the method
guide) could be staring at a blank screen for over a minute waiting on a backend that page
didn't even conceptually need — none of that content is user-specific.

**What's the actual architectural rule this led to?**
"SQL is the source of truth for user state; static teaching content lives in the
frontend." Concretely: the 25-pattern library, the method-guide's worked examples, and all
the reference tables (constraint→complexity, the five optimization moves, the trigger
dictionary, etc.) now live as **typed TypeScript constants** in `src/app/content/`, not
JSON fetched at request time. Per-user state — solve sessions, the trigger log, auth,
AI-backed hints — still requires the backend, and that's the correct line: the split isn't
"never call the backend," it's "never make read-only reference content depend on a
network round-trip that might be slow or down."

**Why typed constants instead of, say, a static JSON file fetched once?**
A missing or malformed field in a typed TS constant is a **compile error** — the build
literally cannot succeed with bad content. A missing field in fetched JSON is a blank
section in production that you find out about from a user, or not at all. Given
`strictTemplates: true` was already enabled in this project's `tsconfig.json`, this also
meant converting components to consume the content layer surfaced real mistakes
immediately as `NG8002` build errors rather than silent runtime gaps — concretely happened
once during this exact migration (a missing `FormsModule` import on a component using
`[(ngModel)]`), caught before it ever shipped.

**How was the 25-pattern content actually generated, and why does that matter?**
Not hand-typed from scratch — curled from the live, already-seeded backend API
(`GET /api/v1/method/patterns(/{slug}/problems)`) and transcribed into the typed constants
via a small generator script. That's a deliberate choice worth naming if asked "how do you
avoid content drift between two sources of truth": this is the *same* content the backend
already serves, moved to where it needs to render instantly, not re-authored and therefore
liable to diverge from it.

**What does prerendering actually buy here, and what was the tricky bug in wiring it up?**
`@angular/ssr` prerenders specific routes (`/method-guide`, `/patterns`, all 25
`/patterns/:slug`) to real static HTML at build time — verified by literally grepping the
built output files for real content strings, not just checking they exist. The
non-obvious bug: Angular's SSR build *always* server-renders the literal `/` route into the
root `index.html` (in this app, `/` redirects to `/patterns`), and the Vercel deployment's
SPA-fallback rewrite was reusing that *same* file as the fallback for every
**non**-prerendered route — so a fresh visit to `/login` briefly flashed Pattern Library
content before Angular's client-side hydration-mismatch recovery corrected it. Root-caused
by diffing response sizes across routes on a Vercel *preview* deployment (never touching
production) before it ever went live, and fixed with a small postbuild script that strips
the server-rendered content into a genuinely neutral fallback shell. Good "found a subtle
bug via a systematic diff, not by guessing" story.

**What had to be fixed to make SSR even *safe* to enable, separate from the content-layer
work?**
Several existing services touched browser-only globals (`localStorage`, `document`,
`window.matchMedia`) **unconditionally**, from code paths that run on every single route
(`AuthService`'s constructor, a keyboard-shortcuts service's init, a custom directive's
field initializer). None of that mattered under pure client-side rendering. Under SSR,
those same lines throw `ReferenceError` on the Node server — and because the SSR host was
a long-lived Express process, one uncaught exception on a single route request **crashed
the whole process**, taking down every other in-flight request too, not just that one
page. Fixed with the standard Angular Universal pattern (`@Inject(PLATFORM_ID)` +
`isPlatformBrowser()` guards), but the process-wide-crash-from-one-route failure mode is
the more interesting thing to be able to explain if asked about SSR gotchas specifically.

---

## 11. Performance optimization — the lazy-loading refactor

A clean, complete "diagnose → fix → measure" story with real before/after numbers, which
is exactly the shape interviewers want for "tell me about a performance problem you
solved."

**What was the actual problem, in one sentence?**
Every feature route (12 of them — Home, Login, Register, Company Tracker, Pattern Library
and its detail page, Constraint Analyzer, both Solve Session pages, Recall Drill, Progress
Dashboard) was declared directly in the root `AppModule`, so every visitor's initial page
load paid for parsing and downloading *all twelve* features' code, regardless of which one
page they actually opened.

**How was it diagnosed, not just guessed at?**
Lighthouse, run against the live SSR server with the desktop preset — Performance scored
73, with the report's own audits (First Contentful Paint 2.2s, Largest Contentful Paint
2.5s) pointing at a large initial JS payload rather than any single render-blocking
resource. Cross-checked against the actual `ng build` output: the initial bundle was
~1.75MB raw / ~372KB gzipped, well over the project's own 1.5MB build budget.

**What was the fix, concretely?**
Converted every one of those 12 components to `standalone: true` with an **explicit,
audited** `imports` array — not a blind find-and-replace: each component's template was
grepped first for its actual `mat-*` tag usage, `ngModel`/`formGroup` usage, and
`routerLink` usage, so each new `imports` array only pulled in the Angular/Material
modules that component's own template genuinely needed. Then every route in
`app-routing.module.ts` switched from `{ path: 'x', component: X }` to
`{ path: 'x', loadComponent: () => import(...).then(m => m.X) }`. `AppModule` now
declares only the app shell.

**What was the measured result?**
Initial bundle: ~372KB → **~152KB gzipped** — roughly a 59% reduction. Lighthouse
Performance on the same page, same methodology: **73 → 86**. First Contentful Paint 2.2s →
1.2s, Largest Contentful Paint 2.5s → 1.8s. A genuinely heavy dependency (Three.js, used
only by the Home page's starfield background) is now isolated entirely inside that route's
own lazy chunk instead of being bundled into every single page load — visitors who never
open Home never download it at all.

**Was 90+ reached, and if not, why is that an honest answer rather than a gap to hide?**
No — landed at 86, and the honest remaining cause is real: Lighthouse flagged no further
render-blocking resources or unused-code after this pass, so the residual gap is the cost
of Angular hydration JS execution plus Lighthouse's own simulated-throttling methodology,
not a fixable single bug. Closing it further would mean either accepting a smaller marginal
gain for real additional engineering effort, or a bigger architectural change (e.g.
partial/island hydration) that wasn't justified for the actual traffic this app gets. Good
answer if asked "did you hit your target" — say what you achieved, say honestly what's
left and why, don't pretend 86 is 90.

**What real bug did this refactor surface, unrelated to bundle size?**
`strictTemplates: true` caught one missing import immediately as a compile error
(mentioned above). Separately, auditing every component's template surfaced a genuinely
pre-existing, previously undetected bug: a custom hover-tilt directive read
`window.matchMedia(...)` in a field initializer with no platform guard — it had been
silently fine only because the one page using it had never actually been exercised under
SSR with its data-dependent content resolved. Good example of "a refactor found a bug the
refactor wasn't looking for."

---

## 12. Design system, visualizer engine & command palette

**How is the visualizer engine architected, and why does that matter for "12+ algorithm
animations"?**
Not twelve bespoke animated components — one shared engine. An algorithm implementation is
a pure function `(input) => Trace`, where a `Trace` is just an array of `Frame` objects
(`{ state, highlights, pointers, vars, explanation, codeLine }`). One
`<app-viz-player>` component drives *any* trace: play/pause/step/scrub/speed, fully
keyboard-operable (`Space`/`←`/`→`/`r`/`0-9`). Rendering is plain SVG bound to the current
frame via Angular template bindings — no canvas, no animation library — because traces are
deterministic data, they're snapshot-testable, and "add a new algorithm" means "write a
trace-generator function," never "write new player UI." 13 trace generators across the 12
algorithm categories all reuse the same 7 structure renderers (array, stack, linked-list,
tree, trie, graph, grid). Good answer if asked "how do you avoid duplicating a UI pattern
across many similar features" — separate the *data model* an animation needs from the
*player* that renders any instance of that model.

**What's the command palette, and why build it instead of using a library?**
`Cmd/Ctrl+K` opens a fuzzy-search palette (patterns, problems, companies, static routes)
with zero new runtime dependency — a hand-written subsequence fuzzy-matcher, recent items
persisted in `localStorage`. All of its data comes from *existing* endpoints
(`PatternService`, `ProblemService`, a direct company-list call) — no new backend surface
was added just to power the palette. Reasonable interview framing: for something this
narrowly scoped (search + keyboard nav + a results list), a from-scratch implementation
was less code and less bundle weight than pulling in a general-purpose command-palette
library and configuring it to fit.

**What does the design token system actually enforce, and why two separate token systems
in one app?**
`tokens.scss` (and a legacy `--bg-0`/`--accent-*` family in `styles.scss`) — every
colour/spacing/radius/motion-duration value in the app is required to reference a named
CSS custom property, never a raw hex/px value inline. Two systems exist side by side on
purpose, not by accident: the newer `tokens.scss` system (used by the command palette, a
dev-only styleguide route, and the visualizer engine) follows a strict "exactly one accent
colour, used sparingly" discipline deliberately borrowed from tools like Linear/Raycast;
the older, broader app surface (most existing pages) intentionally kept a wider, more
varied accent palette after user feedback that an earlier attempt at unifying everything
onto the single-accent system read as "flat" across pages with a lot of simultaneous
information density (e.g. a data table with many status colours). Good "not every
consistency rule should be applied uniformly" answer if pressed on why the app isn't
100% visually unified.

---

## 13. Production operations — real incidents I debugged

This is the section to lead with if asked "tell me about a production issue" — these
actually happened, on this app, this project, with a documented trail.

**Incident 1 — Vercel silently stopped auto-deploying for 8+ hours, and the dashboard
lied about why.**
After a large batch of commits, Vercel's dashboard kept showing "Production" pinned to an
old commit — and every manual "Redeploy"/"Create Deployment" attempt from the dashboard
kept rebuilding that *same stale commit* instead of pulling the actual current branch
head, which was actively misleading during diagnosis. Root cause, found by going around
the dashboard entirely and inspecting the Vercel API directly (`gh api
repos/<owner>/<repo>/hooks` returned an empty array): the GitHub↔Vercel webhook/App
connection had gone stale, even though Vercel's own stored git configuration (`repoId`,
production branch) looked completely correct through the API. **Fix**: Vercel dashboard →
Settings → Git → Disconnect, then reconnect — forces Vercel to re-register its GitHub App
webhook from scratch. Verified with a real test, not just "looks fixed": pushed a trivial
commit and watched a genuinely git-triggered deployment appear automatically within
seconds, for the first time all session. Good answer if asked "tell me about a time the
obvious debugging path was misleading" — the dashboard's own UI was actively wrong about
what was deployed, and the fix required inspecting raw API state instead of trusting it.

**Incident 2 — production backend down, and the error message was 4 exception layers deep
from the real cause.**
The backend stopped responding entirely — not a slow cold start, no response at all even
after 150 seconds. The eventual stack trace (Spring context refresh failure → JPA
entity-manager bean creation failure → Flyway migration failure → MySQL communications
failure) bottomed out at `java.net.UnknownHostException` for the database's own hostname.
That specific exception type is the tell: a *DNS resolution failure* means the hostname
doesn't exist on the network at all right now, which is a different failure mode than a
timeout or connection-refused (both of which would mean the host exists but isn't
answering). That distinction pointed straight at "the database service itself isn't
running," not a network blip or a credentials issue — confirmed by checking the DB
provider's own dashboard, which showed the service status as "Powered off." **Root cause**:
the managed MySQL's free tier automatically powers off the database during inactivity —
not a code regression, not a config drift, an infrastructure behavior. **Fix**: power the
database back on, wait for DNS to actually propagate (a redeploy triggered too early can
race the DNS update and fail once more before succeeding — don't over-read that as a
second unrelated bug), then redeploy the backend. Verified: clean startup, Flyway validated
the *existing* schema version with no migration needed (proof no data was lost), and a
real API call returned real data both directly against the backend and through the
frontend's proxy. Good answer if asked "how do you read a deep stack trace under
pressure" — the actual root cause was the *innermost* `Caused by:`, four framework layers
down from where the error surfaced, and the specific exception *type* (not just its
message) was the diagnostic signal that mattered.

**The meta-lesson connecting both incidents**: on free-tier infrastructure specifically,
"is my code broken" and "is the platform doing something free-tier-specific" are
genuinely different hypotheses that need to be told apart early, and the fastest way to
tell them apart is going straight to the platform's own API/dashboard state rather than
re-reading application code first. Both incidents here turned out to be the second kind.

---

## 14. What I learned building this

The reflective answers — useful for "what was the hardest part" / "what would you do
differently" / "what surprised you" style questions, distinct from the "how does X work"
Q&A above.

**Teaching content shouldn't depend on infrastructure that can be slow or down.** The
whole frontend-static content-layer decision (section 10) only happened because two
independent free-tier constraints — a cold-startable backend and a client-side-only
frontend — compounded into a genuinely bad first-visit experience. The lesson generalizes
past this project: anything that's conceptually "read-only reference material" shouldn't
be architecturally coupled to anything that's conceptually "live application state," even
if it's convenient to serve both from the same API early on. Separating them later is a
real migration, not a config flag — worth deciding the boundary earlier than this project
did.

**A written, running decision log is worth more than it looks like at first.** This
project has a single `CLAUDE.md` file that's been updated after essentially every
significant change — not just "what was built" but *why*, including decisions that were
tried and explicitly reversed (a full visual-theme rewrite got built, shipped, and then
rejected as "looking bad," and the reversal is documented alongside the original attempt
rather than silently erased). The concrete payoff: several incidents and decisions in this
document (the Vercel webhook saga, the Aiven power-off, the AI-free Practice Method
decision) were only reconstructable in this much detail *because* they were written down
immediately, in the moment, not recalled from memory afterward.

**Constraints you can't opt out of produce better engineering decisions than constraints
you set for yourself.** The "must run on free infrastructure" and "the core teaching
feature can't depend on a paid, rate-limited API" constraints weren't things to work
around reluctantly — they're the direct reason the Practice Method's pattern-ID/hints are
deterministic keyword matching instead of an LLM call (more predictable, zero marginal
cost, zero availability risk on someone else's uptime), and the direct reason the content
layer exists at all. A good interview framing: ask "what constraint most shaped a design
decision here," and be ready to explain a constraint that *improved* the design rather
than just limited it.

**The hardest bugs in this project weren't algorithmic — they were "the abstraction is
lying to me" bugs.** The Vercel dashboard showing a deployment that wasn't actually live.
A stack trace whose real cause was four layers beneath the exception that actually
surfaced. A reduced-motion CSS rule that looked correct but left an entire animated
element permanently invisible because `animation: none` freezes an element at its
*pre-animation* state, not its intended resting state. In each case the fix was small once
found; the actual skill exercised was refusing to trust the first plausible explanation
and verifying against the underlying system's real state instead.

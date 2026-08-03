# Drona

*Earn the answer.*

[![GitHub repo](https://img.shields.io/badge/GitHub-drona-181717?logo=github)](https://github.com/Shivanshu-23/drona)

Production-grade AI-powered competitive programming mentor — Java 21 + Spring Boot 3 + Angular 17 + Material UI

---

## ✅ What Works Right Now (No API Keys Needed)

- JWT Authentication (Register / Login)
- Daily Problem view (seeded with Two Sum, 3 real problems)
- Full AI Analysis page with 4 tabs:
  - 💡 3-level Explanation (Beginner / Intermediate / Expert)
  - 💻 3 Solutions (Brute Force / Better / Optimal) with Java code
  - 🎯 Interview Tips, Common Mistakes, Edge Cases, Companies
  - 📚 Revision Notes, Flash Cards, Practice Order, Related Problems
- Swagger UI at `/swagger-ui.html`
- H2 in-memory database (no MySQL setup needed)

---

## 🚀 Quick Start

### Option A — One command (Mac/Linux)
```bash
chmod +x start.sh
./start.sh
```

### Option B — Manual (Windows / any OS)

**Terminal 1 — Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 — Frontend (requires Node.js):**
```bash
cd frontend
npm install
npx ng serve --open
```

---

## 📦 Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Java | 21+ | https://adoptium.net |
| Maven | 3.9+ | https://maven.apache.org |
| Node.js | 18+ | https://nodejs.org (LTS) |
| Angular CLI | 17+ | `npm install -g @angular/cli` |

No MySQL, no Docker, no Redis needed to get started.

---

## 🔗 URLs After Startup

| Service | URL |
|---------|-----|
| Angular Frontend | http://localhost:4200 |
| Spring Boot API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| H2 Console | http://localhost:8080/h2-console |

H2 Console settings: JDBC URL = `jdbc:h2:mem:cpmentor`, User = `sa`, Password = *(blank)*

---

## 🔑 Adding API Keys (Optional — unlocks real AI)

Set environment variables before running the backend:

**Mac/Linux:**
```bash
export GEMINI_API_KEY=your-gemini-key-here
export OPENAI_API_KEY=sk-your-key-here
export YOUTUBE_API_KEY=your-youtube-key-here
cd backend && mvn spring-boot:run
```

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your-gemini-key-here"
$env:OPENAI_API_KEY="sk-your-key-here"
$env:YOUTUBE_API_KEY="your-youtube-key-here"
cd backend; mvn spring-boot:run
```

When `GEMINI_API_KEY` is set, the `/api/v1/ai/analyze/{id}` endpoint calls Gemini first
(falling back to OpenAI, then Claude, then the mock response as each key is unset).
No code changes needed.

---

## 🧪 Quick API Test (without frontend)

**Register:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"rahul","email":"rahul@test.com","password":"secret123"}'
```

**Login and get token:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul@test.com","password":"secret123"}'
```

**Get daily problem (no auth):**
```bash
curl http://localhost:8080/api/v1/problems/daily
```

**Get AI Analysis (no auth needed for GET):**
```bash
curl http://localhost:8080/api/v1/ai/analyze/1
```

---

## 📁 Project Structure

```
cp-mentor/
├── backend/                    ← Spring Boot 3, Java 21
│   ├── pom.xml
│   └── src/main/java/com/cpmentor/
│       ├── config/             ← Security, CORS, WebClient, OpenAPI
│       ├── auth/               ← JWT auth, User entity, filter
│       ├── problem/            ← Problem entity, CRUD API
│       ├── ai/                 ← AI service (mock + OpenAI)
│       ├── common/             ← DataInitializer (seeds problems)
│       └── exception/          ← Global error handler
│
├── frontend/                   ← Angular 17 + Material UI
│   └── src/app/
│       ├── core/               ← Auth service, Problem service, JWT interceptor
│       └── features/
│           ├── home/           ← Daily problem + problem list
│           ├── analysis/       ← Full AI analysis (4 tabs)
│           ├── login/
│           └── register/
│
└── start.sh                    ← One-click startup script
```

---

## 🗺️ Next Steps (Module by Module)

Tell me which to build next:

1. **MySQL + Redis** — swap H2 for production DB, add caching layer
2. **LeetCode GraphQL Integration** — fetch real daily challenges via scheduler
3. **YouTube API** — auto-search tutorials by topic
4. **Bookmark / History / Notes** — user progress tracking
5. **Revision Mode** — spaced repetition scheduling
6. **Docker Compose** — containerize everything
7. **CI/CD** — GitHub Actions pipeline
8. **Claude/Gemini AI** — add alternative AI providers

---

## 🏛️ Architecture Highlights

- **Strategy Pattern** — AI provider swappable via env var (OpenAI / Claude / Gemini)
- **Factory Pattern** — provider instantiation centralized
- **Clean Architecture** — controllers → services → repositories, no leaking entities
- **JWT Stateless Auth** — Spring Security with custom filter chain
- **DTO Pattern** — MapStruct-ready separation (entities never leave service layer)
- **Observer Pattern** — ready for `@EventListener` on `DailyChallengeFetchedEvent`
- **SOLID** — `AIService` open for extension (add providers without touching existing code)

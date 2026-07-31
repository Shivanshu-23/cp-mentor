#!/usr/bin/env bash
# ============================================================
#  AI CP Mentor — One-click startup script
#  Usage: chmod +x start.sh && ./start.sh
# ============================================================

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║     AI Competitive Programming Mentor  ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# ── 1. Check Java ────────────────────────────────────────────
if ! command -v java &>/dev/null; then
  echo -e "${RED}✗ Java not found. Install Java 21+ and try again.${NC}"; exit 1
fi
JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
echo -e "${GREEN}✓ Java ${JAVA_VER} detected${NC}"

# ── 2. Check Node / npm ──────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${YELLOW}⚠ Node.js not found. Frontend will not start.${NC}"
  echo -e "  Install from: https://nodejs.org (LTS recommended)"
  SKIP_FRONTEND=true
else
  NODE_VER=$(node -v)
  echo -e "${GREEN}✓ Node ${NODE_VER} detected${NC}"
  SKIP_FRONTEND=false
fi

# ── 3. Optional API keys ─────────────────────────────────────
echo ""
echo -e "${CYAN}── Optional API Keys (press Enter to skip) ──────────────${NC}"
read -p "Gemini API Key (for real AI analysis, blank = mock): " GEMINI_KEY
read -p "OpenAI API Key (for real AI analysis, blank = mock): " OPENAI_KEY
read -p "YouTube API Key (for video recommendations, blank = mock): " YOUTUBE_KEY
echo ""

# ── 4. Start Backend ─────────────────────────────────────────
echo -e "${CYAN}── Starting Spring Boot Backend ─────────────────────────${NC}"
cd backend

export GEMINI_API_KEY="$GEMINI_KEY"
export OPENAI_API_KEY="$OPENAI_KEY"
export YOUTUBE_API_KEY="$YOUTUBE_KEY"

mvn spring-boot:run -q &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend starting (PID $BACKEND_PID)...${NC}"

# Wait for backend to be ready
echo -n "  Waiting for backend"
for i in {1..30}; do
  if curl -s http://localhost:8080/v3/api-docs > /dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}✓ Backend ready at http://localhost:8080${NC}"
    echo -e "  → Swagger UI:  http://localhost:8080/swagger-ui.html"
    echo -e "  → H2 Console:  http://localhost:8080/h2-console  (JDBC URL: jdbc:h2:mem:cpmentor)"
    break
  fi
  echo -n "."
  sleep 2
done

cd ..

# ── 5. Start Frontend ─────────────────────────────────────────
if [ "$SKIP_FRONTEND" = false ]; then
  echo ""
  echo -e "${CYAN}── Starting Angular Frontend ────────────────────────────${NC}"
  cd frontend

  if [ ! -d "node_modules" ]; then
    echo "  Installing npm packages (first run only)..."
    npm install --silent
  fi

  ng serve --open &
  FRONTEND_PID=$!
  echo -e "${GREEN}✓ Frontend starting at http://localhost:4200${NC}"
  cd ..
fi

# ── 6. Summary ────────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓  AI CP Mentor is running!${NC}"
echo ""
echo -e "  Frontend:  ${CYAN}http://localhost:4200${NC}"
echo -e "  Backend:   ${CYAN}http://localhost:8080${NC}"
echo -e "  Swagger:   ${CYAN}http://localhost:8080/swagger-ui.html${NC}"
echo -e "  H2 DB:     ${CYAN}http://localhost:8080/h2-console${NC}"
echo ""
echo -e "  Press ${RED}Ctrl+C${NC} to stop both servers."
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"

# Keep script alive, kill children on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait

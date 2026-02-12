#!/bin/bash

# Couleurs pour l'output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Starting COCOJA Development Servers${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Trap SIGINT and SIGTERM to kill all background processes
trap 'echo -e "\n${YELLOW}Stopping all servers...${NC}"; kill 0' SIGINT SIGTERM

# Function to run Django server
run_django() {
    echo -e "${GREEN}[Django]${NC} Starting on http://127.0.0.1:8000"
    cd "$(dirname "$0")"
    python3 manage.py runserver
}

# Function to run Vite dev server
run_vite() {
    echo -e "${GREEN}[Vite]${NC} Starting on http://localhost:5173"
    cd "$(dirname "$0")/frontend"
    npm run dev
}

# Start Django in background
run_django &
DJANGO_PID=$!

# Wait a bit for Django to start
sleep 2

# Start Vite in background
run_vite &
VITE_PID=$!

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Servers are running!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Django API:    ${YELLOW}http://127.0.0.1:8000${NC}"
echo -e "  Frontend:      ${YELLOW}http://localhost:5173${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for background processes
wait

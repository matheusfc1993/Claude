#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  🚀 CFO Virtual - Startup Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed. Please install Node.js 18+${NC}"
    exit 1
fi

echo -e "${BLUE}✓ Docker found${NC}"
echo -e "${BLUE}✓ Node.js $(node --version) found${NC}\n"

# Step 1: Start Docker services
echo -e "${YELLOW}[1/5] Starting Docker services...${NC}"
docker-compose up -d

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}[2/5] Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Step 2: Install backend dependencies
echo -e "${YELLOW}[3/5] Installing backend dependencies...${NC}"
cd packages/backend
npm install > /dev/null 2>&1

# Step 3: Run database migrations
echo -e "${YELLOW}[4/5] Running database migrations...${NC}"
npm run db:push > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database migrations successful${NC}"
else
    echo -e "${RED}✗ Database migrations failed${NC}"
fi

# Step 4: Install frontend dependencies
echo -e "${YELLOW}[5/5] Installing frontend dependencies...${NC}"
cd ../frontend
npm install > /dev/null 2>&1

cd ../..

echo -e "\n${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}\n"

echo -e "${BLUE}Next steps:${NC}\n"

echo -e "1️⃣  ${YELLOW}Terminal 1 - Start Backend:${NC}"
echo -e "   ${BLUE}cd packages/backend && npm run dev${NC}\n"

echo -e "2️⃣  ${YELLOW}Terminal 2 - Start Frontend:${NC}"
echo -e "   ${BLUE}cd packages/frontend && npm run dev${NC}\n"

echo -e "3️⃣  ${YELLOW}Open in browser:${NC}"
echo -e "   ${BLUE}http://localhost:5173${NC}\n"

echo -e "${YELLOW}Services running:${NC}"
docker-compose ps

echo -e "\n${BLUE}Status:${NC}"
echo -e "  PostgreSQL: ${GREEN}http://localhost:5432${NC}"
echo -e "  Redis:      ${GREEN}http://localhost:6379${NC}"
echo -e "  Backend:    ${BLUE}(will start in terminal)${NC}"
echo -e "  Frontend:   ${BLUE}(will start in terminal)${NC}\n"

echo -e "${YELLOW}📖 Full guide: cat QUICKSTART.md${NC}"
echo -e "${YELLOW}🆘 Issues? Check troubleshooting section${NC}\n"

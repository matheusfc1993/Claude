# CFO Virtual - Financial Management for Clinics

A comprehensive web-based financial management system with an AI-powered CFO virtual assistant for clinics and consultories.

## Features

- **Financial Management**: Track fixed/variable expenses, revenues, salaries, and professional pró-labore
- **CFO Virtual Assistant**: AI-powered financial advisor using Claude API
- **Automated Reports**: Daily executive reports generated at 20:00 with insights and recommendations
- **Google Sheets Integration**: Bidirectional sync with Google Sheets
- **Multi-tenant**: Support for multiple clinics with role-based access control
- **Dashboard**: Visual analytics with key performance indicators
- **LGPD Compliant**: Privacy-first design with data protection features

## Tech Stack

### Backend
- Node.js + Express.js + TypeScript
- PostgreSQL + Prisma ORM
- Claude API (Anthropic)
- node-cron for scheduling
- JWT authentication

### Frontend
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS
- TanStack Query + Zustand
- Recharts for visualizations

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+

### Setup

1. **Start infrastructure**:
```bash
docker-compose up -d
```

2. **Backend setup**:
```bash
cd packages/backend
npm install
cp .env.example .env
# Update .env with your credentials
npm run db:push
npm run dev
```

3. **Frontend setup**:
```bash
cd packages/frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Project Structure

```
clinic-financial-ai-cfo/
├── packages/
│   ├── backend/          # Express.js API server
│   └── frontend/         # React application
├── docker-compose.yml    # Development infrastructure
└── README.md
```

## Development Roadmap

### SEMANA 1: Foundation ✓
- [x] Project structure
- [x] Database schema (Prisma)
- [x] Authentication (JWT)
- [x] Core financial APIs
- [x] Frontend scaffold

### SEMANA 2: Dashboard + KPIs
- [ ] Metrics service
- [ ] Dashboard visualization
- [ ] KPI calculations

### SEMANA 3: AI + Reports
- [ ] Claude API integration
- [ ] AI context management
- [ ] Daily report generation
- [ ] Chat interface

### SEMANA 4: Google Sheets + Deployment
- [ ] Google Sheets sync
- [ ] LGPD compliance
- [ ] Testing & deployment

## Environment Variables

See `.env.example` files in each package for required variables:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Secret for token signing
- `ANTHROPIC_API_KEY` - Claude API key
- `GOOGLE_CLIENT_ID/SECRET` - Google OAuth credentials

## API Documentation

Core endpoints:

**Auth**
- `POST /api/auth/register` - Create new clinic + admin user
- `POST /api/auth/login` - User login

**Financial**
- `POST /api/financial/:clinicId/fixed-expenses` - Create fixed expense
- `GET /api/financial/:clinicId/fixed-expenses` - List fixed expenses
- `POST /api/financial/:clinicId/variable-expenses` - Create variable expense
- `POST /api/financial/:clinicId/revenues` - Record revenue
- `POST /api/financial/:clinicId/professionals` - Add professional

## License

Proprietary - All rights reserved

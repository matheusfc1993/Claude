# Deployment Guide - CFO Virtual

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional, for containerized deployment)
- Google Cloud Project (for Sheets integration)
- Anthropic API Key (Claude)

## Environment Setup

### 1. Backend Configuration

Create `.env` file in `packages/backend/`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clinic_financial_ai"

# JWT
JWT_SECRET="your-very-secure-random-secret-key-change-in-production"
JWT_EXPIRATION="24h"

# Claude API
ANTHROPIC_API_KEY="sk-ant-your-api-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server
PORT=3000
NODE_ENV="production"
BACKEND_URL="https://your-domain.com"

# Redis (optional)
REDIS_URL="redis://localhost:6379"
```

### 2. Frontend Configuration

Create `.env.local` file in `packages/frontend/`:

```bash
VITE_API_BASE_URL="https://your-domain.com/api"
VITE_APP_NAME="CFO Virtual"
```

### 3. Database Setup

```bash
# Development
cd packages/backend
npm install
npm run db:push

# Production (with migrations)
npm run db:migrate
```

## Deployment Options

### Option A: Docker Compose (Recommended for Development)

```bash
# Start all services
docker-compose up -d

# Verify services
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Option B: Traditional Deployment (Production)

#### Backend

```bash
cd packages/backend

# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

#### Frontend

```bash
cd packages/frontend

# Install dependencies
npm install

# Build
npm run build

# Serve with any static server (nginx, etc.)
# Point to the dist/ directory
```

#### PostgreSQL

```bash
# Using Docker
docker run -d \
  --name postgres \
  -e POSTGRES_USER=clinic_user \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=clinic_financial_ai \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Or use managed service (AWS RDS, Google Cloud SQL, etc.)
```

#### Redis

```bash
# Using Docker
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

## Google Sheets Integration

### Setup Instructions

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Google Sheets API

2. **Create OAuth 2.0 Credentials**
   - Go to Credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Authorized redirect URIs: `https://your-domain.com/api/google/callback`
   - Download JSON credentials

3. **Configure Environment**
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

4. **In Frontend**
   - Users will be prompted to authorize Google Sheets access
   - Select spreadsheet for import/export
   - Automatic sync every 4 hours

### Import/Export Format

**Expenses Sheet**
```
Name          | Category   | Amount | Due Day
Aluguel       | Rent       | 3000   | 1
Internet      | Utilities  | 150    | 10
```

**Revenues Sheet**
```
Date       | Professional | Service              | Amount
2024-01-01 | João Silva   | Physiotherapy       | 150
2024-01-01 | Maria Santos | Massage Therapy     | 120
```

## LGPD Compliance

The system implements LGPD (Lei Geral de Proteção de Dados) requirements:

- ✅ User consent on registration
- ✅ Data processing transparency
- ✅ Automatic audit logging
- ✅ Soft delete support (data retention)
- ✅ Secure password hashing (bcryptjs)
- ✅ HTTPS enforcement (in production)
- ✅ API token expiration (24h)

**Important**: Add Privacy Policy and Terms of Service pages to frontend.

## Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS with valid certificate
- [ ] Configure CORS for your domain only
- [ ] Set up rate limiting on API endpoints
- [ ] Enable database backups (daily minimum)
- [ ] Use environment variables for all secrets
- [ ] Enable audit logging
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Regular security updates for dependencies

## Monitoring & Maintenance

### Logs

```bash
# Docker
docker-compose logs -f backend

# Traditional
# Configure Winston logger in backend/src/config/logger.ts
```

### Database Backups

```bash
# PostgreSQL backup
pg_dump -U clinic_user clinic_financial_ai > backup.sql

# Restore
psql -U clinic_user clinic_financial_ai < backup.sql
```

### Health Check

API provides health endpoint:
```bash
curl http://localhost:3000/health
# Returns: {"status": "ok", "timestamp": "2024-01-01T12:00:00Z"}
```

## Scheduled Jobs

The following jobs run automatically:

- **20:00 (8 PM)**: Daily executive report generation
- **Every 4 hours**: Google Sheets sync (if configured)
- **02:00 (2 AM)**: Cache cleanup and data archival

Monitor via logs:
```bash
[CRON] Starting daily report generation...
[REPORT] Generating report for clinic: Clinic Name
[REPORT] ✓ Report generated for Clinic Name: report-uuid
```

## Performance Optimization

### Caching

- Metrics cache: 5-10 minutes
- Reports cache: 1 hour
- Trending data: 30 minutes

Clear cache manually if needed:
```bash
redis-cli FLUSHDB
```

### Database Indexing

Indexes are automatically created during migration:
- `clinic_id` - All tables
- `date` - Revenue, Variable Expenses
- `created_at` - Audit logs

Add custom indexes if needed:
```sql
CREATE INDEX idx_custom ON table_name(column_name);
```

## Troubleshooting

### Backend won't start

```bash
# Check Node version
node --version  # Should be 18+

# Check environment variables
cat .env

# Check database connection
npm run db:push

# View detailed logs
DEBUG=* npm run dev
```

### API calls failing

```bash
# Test API
curl http://localhost:3000/health

# Check CORS
curl -H "Origin: http://localhost:5173" http://localhost:3000/health

# Verify auth header format
Authorization: Bearer <jwt_token>
```

### Google Sheets sync not working

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check user has authorized access
- Review API quota limits in Google Cloud Console

### High memory usage

- Check database connection pooling
- Clear Redis cache
- Check for memory leaks in logs
- Scale horizontally if needed

## Scaling

### Horizontal Scaling

```bash
# Run multiple backend instances behind load balancer
# Use shared PostgreSQL and Redis
# Configure sticky sessions for auth tokens
```

### Database Optimization

```sql
-- Monitor slow queries
SET log_min_duration_statement = 1000; -- 1 second

-- Analyze performance
EXPLAIN ANALYZE SELECT * FROM revenue WHERE clinic_id = '...';
```

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Test database connectivity
4. Review DEPLOYMENT.md
5. Contact support with logs

---

**Last Updated**: January 2024
**Version**: 1.0.0

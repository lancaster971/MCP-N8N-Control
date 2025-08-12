# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏗️ Project Architecture

### Overview
**n8n Multi-Tenant Control System** - Sistema completo per gestione multi-tenant di istanze n8n con sincronizzazione automatica, monitoring e backup.

### Tech Stack
- **Backend**: Node.js + TypeScript + Express (✅ COMPLETATO)
- **Database**: PostgreSQL 16 con JSONB (✅ COMPLETATO)
- **Authentication**: JWT con bcrypt (✅ COMPLETATO)
- **Scheduler**: node-cron per automazione (✅ COMPLETATO)
- **API Docs**: Swagger/OpenAPI (✅ COMPLETATO)
- **Testing**: Jest + Supertest (✅ COMPLETATO)
- **CI/CD**: GitHub Actions (✅ COMPLETATO)
- **Deployment**: Docker + Docker Compose (✅ COMPLETATO)
- **Frontend**: React + TypeScript + TailwindCSS (🚧 DA FARE)

## 📁 Project Structure

```
n8n-mcp-control/
├── src/                           # ✅ BACKEND COMPLETATO
│   ├── index.ts                   # MCP server entry point
│   ├── server/
│   │   └── express-server.ts      # Express API server
│   ├── api/
│   │   ├── scheduler-controller.ts # Scheduler endpoints
│   │   ├── auth-controller.ts      # Authentication endpoints
│   │   ├── backup-controller.ts    # Backup management
│   │   ├── health-controller.ts    # Health & metrics
│   │   └── swagger-config.ts       # OpenAPI documentation
│   ├── auth/
│   │   └── jwt-auth.ts             # JWT authentication service
│   ├── backend/
│   │   └── multi-tenant-scheduler.ts # Multi-tenant sync scheduler
│   ├── database/
│   │   ├── connection.ts           # PostgreSQL connection pool
│   │   └── migrations/             # SQL migration files
│   ├── monitoring/
│   │   └── health-monitor.ts       # Health monitoring service
│   ├── backup/
│   │   └── database-backup.ts      # Automated backup service
│   └── config/
│       └── environment.ts          # Environment configuration
├── tests/                          # ✅ TEST COMPLETATI
│   ├── unit/                       # Unit tests
│   └── integration/                # Integration tests
├── scripts/                        # ✅ SCRIPTS COMPLETATI
│   ├── docker-start.sh            # Docker startup script
│   └── docker-stop.sh             # Docker shutdown script
├── .github/workflows/              # ✅ CI/CD COMPLETATO
│   ├── ci.yml                     # Main CI/CD pipeline
│   └── code-review.yml            # Automated code review
├── docker-compose.yml             # ✅ Docker orchestration
├── Dockerfile                     # ✅ Multi-stage Docker build
└── frontend/                      # 🚧 TODO - React frontend
    ├── src/
    │   ├── components/            # Reusable components
    │   ├── pages/                 # Page components
    │   ├── hooks/                 # Custom React hooks
    │   ├── services/              # API services
    │   ├── store/                 # State management
    │   ├── utils/                 # Utilities
    │   └── types/                 # TypeScript types
    ├── public/                    # Static assets
    └── package.json
```

## 🛠️ Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Development mode with watch
npm run dev

# Start production server
npm start

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Linting
npm run lint

# Docker operations
./scripts/docker-start.sh [--build] [--with-tools] [--with-monitoring]
./scripts/docker-stop.sh [--clean]

# Start API server
DB_USER=your_user node build/server/express-server.js
```

## 🔐 Database Schema

### Core Tables

#### tenants
- `id` (TEXT PRIMARY KEY) - Tenant identifier
- `name` (VARCHAR) - Tenant name
- `n8n_api_url` (TEXT) - n8n instance API URL
- `n8n_version` (VARCHAR) - n8n version
- `sync_enabled` (BOOLEAN) - Enable/disable sync
- `created_at`, `updated_at`, `last_sync_at` (TIMESTAMP)

#### tenant_workflows
- Multi-tenant workflow storage
- `workflow_data` (JSONB) - Complete workflow JSON
- Foreign key to `tenants.id`

#### tenant_executions
- Execution history per tenant
- `execution_data` (JSONB) - Execution details
- Foreign key to `tenants.id`

#### tenant_sync_logs
- Sync operation tracking
- `status` (success/error)
- `duration_ms`, `items_processed`
- `error_message` for failures

#### auth_users
- `id` (UUID) - User ID
- `email` (VARCHAR UNIQUE) - User email
- `password_hash` (TEXT) - Bcrypt hash
- `role` (VARCHAR) - admin/tenant/readonly
- `tenant_id` (TEXT) - Associated tenant
- `permissions` (JSONB) - Array of permissions
- `api_key` (VARCHAR) - API key for automation

#### auth_sessions
- JWT session tracking
- `token_hash` (TEXT) - Hashed token
- `expires_at` (TIMESTAMP)

#### auth_audit_log
- Complete audit trail
- User actions tracking
- Success/failure logging

#### backup_logs
- Automated backup tracking
- Success/failure status
- File size and duration metrics

## 🔌 API Endpoints (✅ TUTTI IMPLEMENTATI)

### Authentication
```
POST /auth/login              # Login with email/password
POST /auth/register           # Register new user (admin only)
GET  /auth/profile           # Get current user profile
PUT  /auth/profile           # Update profile/password
GET  /auth/users             # List all users
DELETE /auth/users/:id       # Disable user
GET  /auth/audit             # Audit logs
```

### Scheduler Control
```
GET  /api/scheduler/status   # Get scheduler status
POST /api/scheduler/start    # Start scheduler
POST /api/scheduler/stop     # Stop scheduler
POST /api/scheduler/restart  # Restart scheduler
POST /api/scheduler/sync     # Manual sync trigger
```

### Tenant Management
```
GET  /api/tenants            # List all tenants
POST /api/tenants            # Register new tenant
PUT  /api/tenants/:id/sync   # Enable/disable tenant sync
```

### Backup System
```
GET  /api/backup/status      # Backup service status
GET  /api/backup/list        # List available backups
POST /api/backup/create      # Create manual backup
POST /api/backup/restore     # Restore from backup
POST /api/backup/clean       # Clean old backups
POST /api/backup/start       # Start backup service
POST /api/backup/stop        # Stop backup service
```

### Health & Monitoring
```
GET  /health                 # Basic health check
GET  /health/live            # Kubernetes liveness probe
GET  /health/ready           # Kubernetes readiness probe
GET  /health/check           # Detailed health check
GET  /health/metrics         # Prometheus metrics
GET  /health/dashboard       # Dashboard data with trends
```

### Statistics & Logs
```
GET  /api/stats              # System statistics
GET  /api/logs               # Sync logs with pagination
```

### Documentation
```
GET  /api-docs               # Swagger UI
GET  /api-docs.json          # OpenAPI specification
```

## 🔑 Environment Variables

### Required
```bash
# n8n Connection
N8N_API_URL=https://your-n8n.com/api/v1
N8N_API_KEY=your-api-key

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/n8n_mcp
DB_HOST=localhost
DB_PORT=5432
DB_NAME=n8n_mcp
DB_USER=your_user
# DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your-secret-min-32-chars
JWT_EXPIRES_IN=24h
SALT_ROUNDS=12
```

### Optional
```bash
# API Server
API_PORT=3001
API_HOST=0.0.0.0
NODE_ENV=production
CORS_ORIGINS=http://localhost:3000

# Scheduler
TENANT_SYNC_INTERVAL=5        # minutes
MAX_CONCURRENT_TENANTS=5
SYNC_BATCH_SIZE=50

# Backup
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *     # 2 AM daily
BACKUP_PATH=./backups
BACKUP_RETENTION_DAYS=7

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
```

## 🐳 Docker Deployment

### Quick Start
```bash
# Start all services
docker-compose up -d

# With optional services
docker-compose --profile tools --profile monitoring up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Clean everything
docker-compose down -v
```

### Available Profiles
- `tools` - pgAdmin for database management
- `monitoring` - Prometheus & Grafana
- `cache` - Redis for caching (future)

## 🔒 Security Features (✅ IMPLEMENTATE)

### Authentication & Authorization
- JWT tokens with 24h expiration
- Bcrypt password hashing (12 rounds)
- Role-based access control (admin/tenant/readonly)
- Fine-grained permissions system
- API key support for automation

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 req/15min)
- SQL injection protection via parameterized queries

### Audit & Compliance
- Complete audit logging
- Soft delete for data retention
- Automated backup with compression
- Environment-based configuration

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Unit tests only
npm test tests/unit

# Integration tests
npm test tests/integration

# With coverage
npm run test:coverage
```

## 📊 Monitoring (✅ IMPLEMENTATO)

### Health Checks
- Database connectivity
- Scheduler status
- Memory usage
- Disk space
- API uptime

### Metrics Exposed
- Prometheus format on `/health/metrics`
- Request latency
- Database query times
- Sync success/failure rates
- Tenant statistics

## 🚀 CI/CD Pipeline (✅ CONFIGURATO)

### GitHub Actions Workflows

#### CI Pipeline (`ci.yml`)
- Triggered on push/PR
- Runs tests with PostgreSQL
- Builds Docker images
- Security scanning
- Automated releases

#### Code Review (`code-review.yml`)
- ESLint analysis
- TypeScript checking
- Test coverage report
- Bundle size analysis
- Security audit

## 📝 Frontend Development (🚧 DA IMPLEMENTARE)

### Planned Tech Stack
```
- React 18+ with TypeScript
- TailwindCSS for styling
- React Query for data fetching
- React Router for navigation
- Recharts for data visualization
- React Hook Form for forms
- Zustand for state management
- Vite for build tool
```

### Planned Features
```
1. Dashboard Overview
   - Real-time metrics
   - System health status
   - Recent activity feed
   - Quick actions

2. Tenant Management
   - List/create/edit tenants
   - Sync configuration
   - Individual tenant dashboard
   - Tenant-specific metrics

3. Scheduler Control
   - Start/stop/restart controls
   - Sync history timeline
   - Manual sync trigger
   - Schedule configuration

4. User Management
   - User CRUD operations
   - Role assignment
   - Permission management
   - Activity logs

5. Backup Management
   - Backup list with status
   - Manual backup creation
   - Restore interface
   - Schedule configuration

6. Monitoring Dashboard
   - Health status cards
   - Performance metrics
   - Error tracking
   - Alert configuration

7. System Settings
   - Environment configuration
   - API settings
   - Security settings
   - Notification preferences
```

### Frontend API Service Structure
```typescript
// services/api.ts
class ApiService {
  // Auth
  login(email: string, password: string): Promise<AuthResponse>
  logout(): Promise<void>
  getProfile(): Promise<User>
  
  // Tenants
  getTenants(): Promise<Tenant[]>
  createTenant(data: TenantInput): Promise<Tenant>
  updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant>
  
  // Scheduler
  getSchedulerStatus(): Promise<SchedulerStatus>
  startScheduler(): Promise<void>
  stopScheduler(): Promise<void>
  
  // Monitoring
  getHealthCheck(): Promise<HealthStatus>
  getMetrics(): Promise<Metrics>
  getDashboardData(): Promise<DashboardData>
  
  // Backup
  getBackups(): Promise<Backup[]>
  createBackup(label?: string): Promise<BackupResult>
  restoreBackup(filename: string): Promise<void>
}
```

### Frontend Component Structure
```
components/
├── layout/
│   ├── Header.tsx         # Navigation bar
│   ├── Sidebar.tsx        # Side navigation
│   └── Footer.tsx         # Footer info
├── dashboard/
│   ├── StatsCard.tsx      # Metric display card
│   ├── ActivityFeed.tsx   # Recent activities
│   └── HealthStatus.tsx   # System health
├── tenants/
│   ├── TenantList.tsx     # Table of tenants
│   ├── TenantForm.tsx     # Create/edit form
│   └── TenantCard.tsx     # Tenant info card
├── scheduler/
│   ├── SchedulerControl.tsx # Start/stop controls
│   ├── SyncHistory.tsx      # Timeline view
│   └── SyncStatus.tsx       # Current status
└── common/
    ├── Button.tsx           # Reusable button
    ├── Modal.tsx            # Modal dialog
    ├── Table.tsx            # Data table
    └── Loading.tsx          # Loading spinner
```

## 🎯 Next Steps for Frontend

### Phase 1: Setup & Core (Priority 1)
1. Initialize React project with Vite
2. Setup TailwindCSS and component library
3. Configure React Router
4. Setup API service layer
5. Implement authentication flow

### Phase 2: Main Features (Priority 2)
1. Dashboard overview page
2. Tenant management CRUD
3. Scheduler control panel
4. User management interface
5. Basic monitoring views

### Phase 3: Advanced Features (Priority 3)
1. Backup management UI
2. Advanced metrics visualization
3. Real-time updates (WebSocket)
4. Alert configuration
5. System settings management

### Phase 4: Polish & Optimization (Priority 4)
1. Responsive design optimization
2. Dark mode support
3. Performance optimization
4. Error boundary implementation
5. Progressive Web App features

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify credentials
psql -U your_user -d n8n_mcp -c "SELECT 1"
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### Docker Build Fails
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

## 📚 Additional Resources

- [n8n API Documentation](https://docs.n8n.io/api/)
- [MCP Protocol Spec](https://modelcontextprotocol.io)
- [PostgreSQL JSONB Guide](https://www.postgresql.org/docs/current/datatype-json.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [React Best Practices](https://react.dev/learn)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🔄 Version History

- **v1.0.0** - Complete backend with all 10 priorities implemented
- **v0.9.0** - CI/CD pipeline configured
- **v0.8.0** - Test suite completed
- **v0.7.0** - Backup system implemented
- **v0.6.0** - Health monitoring and metrics
- **v0.5.0** - API documentation with Swagger
- **v0.4.0** - Docker deployment ready
- **v0.3.0** - Authentication system
- **v0.2.0** - REST API implementation
- **v0.1.0** - Initial multi-tenant structure

---

**Note**: This document is actively maintained. Update it when making significant changes to the architecture or adding new features.
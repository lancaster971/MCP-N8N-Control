# PilotPro Control Center

[![npm version](https://badge.fury.io/js/%40pilotpro%2Fcontrol-center.svg)](https://badge.fury.io/js/%40pilotpro%2Fcontrol-center)

A Premium Multi-Tenant Workflow Management System with advanced control and monitoring capabilities.

## Overview

PilotPro Control Center is a premium multi-tenant workflow management platform that provides complete control over workflow automation systems. It features advanced monitoring, real-time statistics, automatic scheduling, and a beautiful glassmorphism UI.

## 🚀 Features

### Backend Completato
- ✅ **Multi-Tenant Architecture** - Complete isolation between tenants
- ✅ **PostgreSQL 16 Database** - 40+ tables with JSONB support
- ✅ **JWT Authentication** - Secure role-based access control
- ✅ **Automatic Scheduler** - Cron-based synchronization
- ✅ **RESTful API** - Complete CRUD operations
- ✅ **Swagger Documentation** - Interactive API docs
- ✅ **Real-time Statistics** - KPIs and metrics calculation
- ✅ **Audit System** - Complete operation tracking
- ✅ **Backup System** - Automatic data protection
- ✅ **Docker Support** - Ready for containerization

### Frontend Premium
- 🎨 **Glassmorphism Design** - Beautiful transparent effects
- 🌙 **Dark Mode** - Elegant dark theme by default
- 📊 **Interactive Charts** - ApexCharts & D3.js visualizations
- 🔄 **Real-time Updates** - WebSocket connections
- 🎯 **React Flow** - Visual workflow builder
- ⚡ **Vite + React 18** - Lightning fast development
- 💅 **TailwindCSS** - Premium components
- 🔐 **Protected Routes** - Secure navigation

## Installation

### Prerequisites

- Node.js 20 or later
- PostgreSQL 16
- Workflow automation instance with API access enabled

### Install from npm

```bash
npm install -g @pilotpro/control-center
```

### Install from source

```bash
# Clone the repository
git clone https://github.com/pilotpro/control-center.git
cd pilotpro-control-center

# Install dependencies
npm install

# Build the project
npm run build

# Run migrations
npm run migrate

# Start the server
npm start
```

### Docker Installation

```bash
# Pull the image
docker pull pilotpro/control-center

# Run the container
docker run -e WORKFLOW_API_URL=http://your-workflow:5678/api/v1 \
           -e WORKFLOW_API_KEY=your-api-key \
           -e DATABASE_URL=postgresql://user:pass@localhost:5432/pilotpro \
           -p 3001:3001 \
           pilotpro/control-center
```

## Configuration

### Environment Variables

```env
# API Configuration
WORKFLOW_API_URL=http://localhost:5678/api/v1
WORKFLOW_API_KEY=your-api-key

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/pilotpro

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production
```

## Usage

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Access the beautiful UI at `http://localhost:5173`

### Backend Development

```bash
npm run dev
```

API available at `http://localhost:3001`
Swagger docs at `http://localhost:3001/api-docs`

## Database Schema

The system uses PostgreSQL 16 with 40+ tables including:

- **tenants** - Multi-tenant management
- **workflows** - Workflow definitions with JSONB
- **executions** - Execution history and logs
- **auth_users** - User authentication
- **audit_logs** - Complete audit trail
- **backup_logs** - Backup tracking
- **kpi_metrics** - Performance metrics
- **sync_state** - Synchronization status

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get profile

### Workflows
- `GET /workflows` - List all workflows
- `GET /workflows/:id` - Get workflow details
- `POST /workflows` - Create workflow
- `PUT /workflows/:id` - Update workflow
- `DELETE /workflows/:id` - Delete workflow

### Executions
- `GET /executions` - List executions
- `GET /executions/:id` - Get execution details
- `POST /executions/:id/retry` - Retry execution

### Tenants
- `GET /tenants` - List tenants
- `POST /tenants` - Create tenant
- `PUT /tenants/:id` - Update tenant
- `DELETE /tenants/:id` - Delete tenant

## Tech Stack

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL 16** - Database with JSONB
- **JWT** - Authentication
- **node-cron** - Scheduler
- **Swagger** - API documentation
- **Jest** - Testing framework

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **ApexCharts** - Charts
- **React Flow** - Workflow visualization

## License

MIT

## Author

PilotPro Team

## Support

For support, email support@pilotpro.com or open an issue on GitHub.
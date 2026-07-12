# AssetFlow — Enterprise Asset & Resource Management System

A production-grade ERP system for managing organizational assets across their full lifecycle — from procurement to disposal — with role-based access, approval workflows, resource booking, maintenance tracking, and audit capabilities.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + RBAC |
| Real-time | Socket.io |
| Storage | Cloudinary |

## Prerequisites

- Node.js >= 18
- Docker & Docker Compose (for PostgreSQL)
- npm >= 9

## Quick Start

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 3. Setup Frontend

```bash
cd client
npm install
npm run dev
```

## Project Structure

```
├── server/          # Express.js backend
│   ├── prisma/      # Schema & migrations
│   └── src/         # Feature-based modules
├── client/          # React frontend
│   └── src/         # Components, features, hooks
├── docker-compose.yml
└── README.md
```

## User Roles

| Role | Capabilities |
|------|-------------|
| Admin | Full system access, manage departments/categories/users, create audits |
| Asset Manager | Register/allocate assets, approve transfers/maintenance/returns |
| Department Head | Approve dept allocations/transfers, view dept assets, book resources |
| Employee | View own assets, book shared resources, raise maintenance/transfer requests |

## License

MIT

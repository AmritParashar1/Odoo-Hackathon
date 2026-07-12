# AssetFlow — Enterprise Asset & Resource Management System

A production-grade ERP system for managing organizational assets across their full lifecycle — from procurement to disposal. Features include role-based access control, approval workflows, resource booking, maintenance tracking, and real-time audit capabilities.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Vite, TypeScript, TailwindCSS, shadcn/ui, TanStack Query |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL (Dockerized) |
| **ORM** | Prisma |
| **Auth** | JWT + HttpOnly Cookies + RBAC |
| **Real-time** | Socket.io |

---

## 💻 Local Setup & Installation

Follow these exact steps to run the full-stack application on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (must be running to spin up the database)

### 1. Start the Database (PostgreSQL)
We use Docker to instantly spin up a local PostgreSQL database without needing to manually install Postgres.

```bash
# In the root folder of the project, run:
docker-compose up -d
```

### 2. Set Up the Backend (Server)
Open a new terminal and navigate to the `server` directory.

```bash
cd server

# Install dependencies
npm install

# Create your local environment variables
cp .env.example .env

# Generate the database tables
npx prisma migrate dev

# Populate the database with mock data (Users, Assets, etc.)
npx prisma db seed

# Start the backend server
npm run dev
```
*The backend is now running on `http://localhost:3000`*

### 3. Set Up the Frontend (Client)
Open a completely separate terminal window and navigate to the `client` directory.

```bash
cd client

# Install dependencies
npm install

# Create your local environment variables
cp .env.example .env

# Start the React frontend
npm run dev
```
*The frontend is now running on `http://localhost:5173`*

---

## 🔑 Login Credentials

Because you ran `npx prisma db seed`, your database is already populated with test users for every single role!

You can test the application by logging into the frontend (`http://localhost:5173`) using any of these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@assetflow.com` | `Password@123` |
| **Asset Manager** | `manager@assetflow.com` | `Password@123` |
| **Department Head** | `head.ops@assetflow.com` | `Password@123` |
| **Employee** | `john.doe@assetflow.com` | `Password@123` |

---

## 🏗️ Project Structure

```text
├── server/                   # Express.js REST API & WebSocket Server
│   ├── prisma/               # Database Schema, Migrations, and Seed Scripts
│   └── src/                  # Feature-based backend modules (Assets, Users, Auth)
│
├── client/                   # React Frontend (Vite)
│   ├── src/features/         # Core application pages (Dashboard, Assets, Bookings)
│   ├── src/components/       # Reusable UI components (shadcn/ui)
│   └── src/api/              # Axios API client & Interceptors
│
└── docker-compose.yml        # Local PostgreSQL container configuration
```

## 🛡️ User Roles & Permissions

- **Admin:** Full system access, manage departments/categories/users, create system-wide audits.
- **Asset Manager:** Register new assets, allocate hardware, approve transfers/maintenance/returns.
- **Department Head:** Approve intra-department allocations/transfers, view dept assets, book resources.
- **Employee:** View their own assigned assets, book shared resources (conference rooms), raise maintenance/transfer requests.

## 📄 License
MIT License

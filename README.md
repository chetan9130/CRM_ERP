# Mini ERP + CRM Operations Portal

A full-stack, internal operations portal built for wholesale and distribution companies. This single-monorepo application covers user authentication, customer CRM interactions, product inventory alerts, and transaction-safe sales challan execution.

---

## 1. Directory Structure

```text
CRM/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection setups
│   │   ├── middleware/      # JWT auth & role check guards
│   │   ├── routes/          # API route controllers
│   │   ├── validators/      # Zod input validation schemas
│   │   └── index.js         # App entrypoint
│   ├── migrations/          # PostgreSQL SQL setup scripts
│   ├── scripts/             # Migration and seeding JS runners
│   ├── .env.example
│   ├── tsconfig.json
│   ├── package.json
│   └── api.http             # REST Client testing collection
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client bindings
│   │   ├── components/      # Common Layout files (Sidebar, Topbar)
│   │   ├── context/         # AuthContext state wrappers
│   │   ├── pages/           # Operations Dashboard, CRM & Product screens
│   │   ├── routes/          # Protected and Role-based router guards
│   │   ├── types/           # TypeScript interfaces matching DB schema
│   │   ├── App.tsx          # Router wiring
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 2. Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL database instance (local or Supabase)

### Step 1: Install Dependencies
Install packages in both backend and frontend directories:

```bash
# In backend/
cd backend
npm install

# In frontend/
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in both folders and adjust values.

**Backend (`backend/.env`)**:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
# Or individual connection settings:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=password
# DB_NAME=crm_erp
# DB_SSL=true
JWT_SECRET=your_super_secret_jwt_key_here
```

**Frontend (`frontend/.env`)**:
Create a `.env` file inside `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 3. Running Database Migrations & Seeding

The backend includes custom TypeScript scripts to safely build schemas and seed sample data.

```bash
# Make sure you are inside the backend directory
cd backend

# 1. Run migrations (Creates tables, check constraints & foreign keys)
npm run db:migrate

# 2. Run seed script (Truncates existing tables and inserts fresh mock data)
npm run db:seed
```

### Mock Accounts Seeded
You can log in using these accounts to test role-based constraints:

| Role | Email | Password | Allowed Operations |
|---|---|---|---|
| **Admin** | `admin@example.com` | `admin123` | Full access to CRM, Inventory, Challans, and deletions. |
| **Sales** | `sales@example.com` | `sales123` | CRUD Customers, Add Notes, Create Draft & Confirm Challans. |
| **Warehouse** | `warehouse@example.com` | `warehouse123` | Read CRM, CRUD Products, Adjust Stock levels. Route guarded from editing challans/customers. |
| **Accounts** | `accounts@example.com` | `accounts123` | Read-only access to Customers, Products, and Challans. |

---

## 4. Running Locally

Start both the backend API server and Vite frontend dev server:

```bash
# Start backend API (runs on http://localhost:5000)
cd backend
npm run dev

# Start frontend Vite dev server (runs on http://localhost:5173)
cd frontend
npm run dev
```

---

## 5. Architecture Overview

### Backend API Design
The backend is a Node.js Express server. Database connectivity is managed through connection pools using the `pg` client, optimized with SSL configurations to support Supabase/Railway/Aiven/Render deployments natively. Security is enforced through stateless JWT validation middleware (`authenticateToken`) alongside role checking decorators (`requireRole`), ensuring strict backend verification of user operations. 

### Database Concurrency Control
To ensure absolute inventory accuracy under concurrent orders, Sales Challan confirmation is processed inside a strict database transaction. The engine sorts product IDs in ascending order and locks product rows sequentially using `SELECT ... FOR UPDATE` query operations. This prevents deadlock conditions and guarantees that stock checks are atomic—if any line item request exceeds available inventory, the transaction rolls back completely, preventing partial orders.

### Frontend Application Design
The client is scaffolded with Vite and React, coded in strict TypeScript. Routing is configured through modern React Router DOM, protected with token check wrappers (`ProtectedRoute`) and authorization walls (`RoleRoute`). Responsive UI grids are styled using vanilla CSS variables, adopting a dark-mode-first aesthetic with glassmorphic cards and color-coded role indicators.

---

## 6. Deployment Guidelines

### Database (Supabase or local PostgreSQL)
1. Register a PostgreSQL database instance on [Supabase](https://supabase.com).
2. Grab the DATABASE_URL connection string.
3. Paste the credentials into the backend environment variables (`backend/.env`).

### Backend API (Render)
1. Deploy the `backend/` folder to [Render](https://render.com) as a Web Service.
2. Select Node environment and set build command: `npm install && npm run build`.
3. Set start command: `npm start`.
4. Add environment variables: `PORT=10000`, `DATABASE_URL` (Supabase connection), and `JWT_SECRET`.

### Frontend Client (Vercel)
1. Deploy the `frontend/` folder to [Vercel](https://vercel.com).
2. Configure build settings: build command is `npm run build` and output directory is `dist`.
3. Add environment variable: `VITE_API_URL=https://your-backend-render-app.onrender.com/api`.

---

## 7. Known Limitations & Assumptions

1. **Self-Deleting Protection**: The backend database restricts deleting products or customer accounts if they are referenced in confirmed stock movements or sales challan line items to maintain audit history consistency (returns `409 Conflict`).
2. **Sequential Challan Sequences**: Challan numbers are governed by an auto-increment sequence helper table (`sales_challan_number_seq`). If a transaction fails or rolls back, sequence increments may be skipped, which is standard to prioritize transaction throughput.
3. **Session Expiration Interception**: The Axios client responds to token validation failures (401) by immediately clearing localStorage and reloading the window to redirect users to `/login`.

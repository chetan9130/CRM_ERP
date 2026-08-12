# CRM ERP System

A modern, full-stack **Customer Relationship Management (CRM) and Enterprise Resource Planning (ERP)** web application designed to manage users, customers, business operations, and CRM data through a secure and responsive interface.

The project follows a **three-tier architecture** with a React frontend, Node.js/Express backend, and PostgreSQL database.

---

## 📌 Project Overview

The CRM ERP system provides a centralized platform for managing customer and business-related information.

The application is designed with a responsive user interface and supports desktop, tablet, and mobile devices.

### Main Features

* 🔐 User registration and login
* 🔑 JWT-based authentication
* 🔒 Password hashing using bcrypt
* 👥 User management
* 👤 Customer management
* 📊 Dashboard and statistics
* 🔎 Search and filtering
* 📝 Forms and CRUD operations
* 📱 Fully responsive interface
* 🌐 RESTful API
* 🗄️ PostgreSQL database
* 🔄 Database migrations
* 🌱 Database seed scripts
* ❤️ Backend health monitoring
* 🛡️ CORS protection
* ☁️ Cloud deployment
* ⚙️ Environment-based configuration

---

# 🔐 CRM Demo Credentials

The following demo accounts can be used to test the different CRM roles.

> **Note:** Passwords are stored securely in the database using bcrypt hashing. The passwords below are demo credentials for testing and are not the stored password hashes.

| Role | Email | Demo Password |
|---|---|---|
| **Admin** | `admin@mail.com` | `admin123` |
| **Sales Agent** | `sales@mail.com` | `sales123` |
| **Warehouse Manager** | `warehouse@mail.com` | `warehouse123` |
| **Accounts Officer** | `accounts@mail.com` | `accounts123` |

**Important:** I used the passwords `admin123`, `sales123`, `warehouse123`, and `accounts123`
as the demo credentials.

### Admin

# 🏗️ System Architecture

The system follows a **three-tier architecture**:

1. Presentation Layer
2. Application Layer
3. Data Layer

```text
                         ┌──────────────────────┐
                         │         USER         │
                         │ Desktop / Tablet /   │
                         │       Mobile        │
                         └──────────┬───────────┘
                                    │
                                  HTTPS
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                      │
│                         VERCEL                           │
│                                                          │
│  React       TypeScript       Vite       Tailwind CSS    │
│                                                          │
│  ┌────────┬────────┬─────────┬────────┬───────────────┐ │
│  │ Login  │Dashboard│ Users  │Customers│ Settings      │ │
│  ├────────┼────────┼─────────┼────────┼───────────────┤ │
│  │Sidebar │ Forms  │ Tables │ Charts │ Search/Filters │ │
│  └────────┴────────┴─────────┴────────┴───────────────┘ │
│                                                          │
│                         Axios                            │
└──────────────────────────┬───────────────────────────────┘
                           │
                        REST API
                          HTTPS
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│                         RENDER                           │
│                                                          │
│                  Node.js + Express.js                    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                    Middleware                      │  │
│  │                                                    │  │
│  │  CORS │ JSON Parser │ JWT │ Validation │ Errors  │  │
│  └─────────────────────────┬──────────────────────────┘  │
│                            │                             │
│                    API Routes                           │
│                            │                             │
│      ┌────────────┬────────┼───────────┬─────────────┐ │
│      │            │        │           │             │ │
│      ▼            ▼        ▼           ▼             ▼ │
│    Auth         Users   Customers   Dashboard      Health│
│      │            │        │           │             │ │
│      └────────────┴────────┼───────────┴─────────────┘ │
│                            │                             │
│                     Business Logic                       │
│                            │                             │
│                     JWT + bcrypt                         │
└────────────────────────────┬─────────────────────────────┘
                             │
                            SQL
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                     DATA LAYER                           │
│                    POSTGRESQL                            │
│                                                          │
│        ┌─────────┐  ┌────────────┐  ┌───────────────┐   │
│        │  Users  │  │ Customers  │  │  CRM Data     │   │
│        └─────────┘  └────────────┘  └───────────────┘   │
│                                                          │
│             Migrations + Seed Scripts                    │
└──────────────────────────────────────────────────────────┘
```

---

# 🔄 Application Data Flow

The complete request flow is:

```text
User
  ↓
React UI
  ↓
Axios
  ↓
REST API
  ↓
Express Router
  ↓
Middleware
  ↓
Authentication / Validation
  ↓
Business Logic
  ↓
PostgreSQL
  ↓
API Response
  ↓
React State
  ↓
Updated UI
```

---

# 🖥️ Frontend Architecture

The frontend is developed using:

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Lucide React

## Frontend Components

The frontend contains reusable components such as:

### Navigation

* Responsive sidebar
* Navbar/header
* Mobile navigation drawer
* Profile menu
* Navigation links

### Authentication

* Login page
* Registration page
* Authentication forms
* Protected routes

### Dashboard

* Statistics cards
* Charts
* Activity information
* Summary panels

### Customer Management

* Customer list
* Customer creation form
* Customer editing
* Customer details
* Customer deletion
* Search
* Filtering
* Pagination

### User Management

* User list
* User creation
* User editing
* User deletion
* Role management

### UI Components

* Buttons
* Inputs
* Select fields
* Tables
* Cards
* Dialogs
* Modals
* Dropdowns
* Alerts
* Loading states
* Empty states
* Error states

---

# 📱 Responsive Design

The frontend is designed to work across:

```text
Mobile
   ↓
Tablet
   ↓
Laptop
   ↓
Desktop
   ↓
Large Desktop
```

Responsive behavior includes:

* Mobile navigation drawer
* Responsive dashboard cards
* Responsive tables
* Responsive forms
* Responsive modals
* Responsive charts
* Flexible layouts
* Mobile-friendly buttons
* Touch-friendly controls

Tailwind CSS responsive breakpoints are used to adapt the UI.

---

# ⚙️ Backend Architecture

The backend is built using:

* Node.js
* Express.js
* JWT
* bcrypt/bcryptjs
* CORS
* Zod
* PostgreSQL

The backend is responsible for:

* API routing
* Authentication
* Authorization
* Validation
* Business logic
* Database communication
* Error handling
* CORS
* Health monitoring

---

# 🧩 Backend Components

```text
Express Application
       │
       ├── Middleware
       │    ├── CORS
       │    ├── JSON Parser
       │    ├── JWT Authentication
       │    ├── Validation
       │    └── Error Handling
       │
       ├── Routes
       │    ├── Authentication
       │    ├── Users
       │    ├── Customers
       │    ├── Dashboard
       │    └── Health
       │
       ├── Business Logic
       │
       └── Database Layer
            └── PostgreSQL
```

---

# 🔐 Authentication Architecture

The system uses **JWT-based authentication**.

### Login Flow

```text
User
 ↓
Email + Password
 ↓
POST /auth/login
 ↓
Express API
 ↓
Validate Input
 ↓
Find User in PostgreSQL
 ↓
bcrypt Password Verification
 ↓
Generate JWT
 ↓
Return Token
 ↓
Frontend
```

Protected APIs use:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 🔒 Password Security

Passwords are never stored as plain text.

During registration:

```text
Password
   ↓
bcrypt
   ↓
Password Hash
   ↓
PostgreSQL
```

During login:

```text
Entered Password
       ↓
bcrypt.compare()
       ↓
Stored Password Hash
       ↓
Valid / Invalid
```

---

# 🗄️ Database Architecture

The application uses **PostgreSQL** as the relational database.

The database stores:

* Users
* Customers
* CRM information
* Application records
* Related business data

Database communication is handled through a PostgreSQL connection pool.

---

# 🔄 Database Migration

Database structure is managed using SQL migrations.

Example:

```text
backend/
├── migrations/
│   └── 001_init.sql
│
└── scripts/
    ├── migrate.js
    └── seed.js
```

Run migration:

```bash
node scripts/migrate.js
```

Run seed:

```bash
node scripts/seed.js
```

---

# 🌐 API Architecture

The frontend communicates with the backend using REST APIs.

## Authentication

| Method | Endpoint         | Description   |
| ------ | ---------------- | ------------- |
| POST   | `/auth/register` | Register user |
| POST   | `/auth/login`    | Login user    |

## Users

| Method | Endpoint     | Description   |
| ------ | ------------ | ------------- |
| GET    | `/users`     | Get all users |
| GET    | `/users/:id` | Get user      |
| PUT    | `/users/:id` | Update user   |
| DELETE | `/users/:id` | Delete user   |

## Customers

| Method | Endpoint         | Description     |
| ------ | ---------------- | --------------- |
| GET    | `/customers`     | Get customers   |
| GET    | `/customers/:id` | Get customer    |
| POST   | `/customers`     | Create customer |
| PUT    | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |

## System

| Method | Endpoint      | Description                 |
| ------ | ------------- | --------------------------- |
| GET    | `/`           | Backend status              |
| GET    | `/api/health` | Backend and database health |

---

# ❤️ Health Monitoring

The backend provides a health endpoint:

```http
GET /api/health
```

Example response:

```json
{
  "status": "ok",
  "message": "CRM backend is running",
  "database": "connected"
}
```

The root endpoint provides:

```http
GET /
```

Example:

```json
{
  "status": "ok",
  "message": "CRM Backend API is running"
}
```

---

# 🔐 Environment Configuration

Sensitive configuration is managed through environment variables.

## Frontend

Local:

```env
VITE_API_URL=http://localhost:5000
```

Production:

```env
VITE_API_URL=https://crm-erp-uo8j.onrender.com
```

## Backend

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Production:

```env
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://crm-erp-sage.vercel.app
```

Never commit environment files containing secrets.

---

# 🌍 CORS

Because the frontend and backend are hosted separately, CORS is configured on the Express server.

Development:

```text
http://localhost:5173
```

Production:

```text
https://crm-erp-sage.vercel.app
```

The production frontend URL should not contain a trailing slash.

---

# 📁 Project Structure

```text
CRM/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── ...
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── ...
│   │
│   ├── migrations/
│   │   └── 001_init.sql
│   │
│   ├── scripts/
│   │   ├── migrate.js
│   │   └── seed.js
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

# 🚀 Installation and Setup

## Requirements

Install:

* Node.js 18+
* npm
* Git
* PostgreSQL

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

## 1. Clone Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd CRM
```

---

## 2. Install Frontend

```bash
cd frontend
npm install
```

Create:

```text
.env.local
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

Start:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 3. Install Backend

Open another terminal:

```bash
cd backend
npm install
```

Create:

```text
.env
```

Add:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/crm
JWT_SECRET=your_secure_secret
FRONTEND_URL=http://localhost:5173
```

---

## 4. Setup Database

Create a PostgreSQL database.

Example:

```text
crm
```

Run migration:

```bash
node scripts/migrate.js
```

Run seed:

```bash
node scripts/seed.js
```

---

## 5. Start Backend

```bash
npm start
```

Backend:

```text
http://localhost:5000
```

---

# ☁️ Deployment

The production architecture uses:

```text
Frontend  → Vercel
Backend   → Render
Database  → PostgreSQL
```

## Deployment Diagram

```text
                         GitHub
                        /      \
                       /        \
                      ▼          ▼
                  Vercel       Render
                     │           │
                     │           ▼
                     │       Express API
                     │           │
                     │           ▼
                     │       PostgreSQL
                     │
                     └── HTTPS API ──►
```

---

# ▲ Vercel Deployment

For a monorepo, set:

```text
Root Directory:
frontend
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Add environment variable:

```text
VITE_API_URL=https://crm-erp-uo8j.onrender.com
```

After changing a `VITE_*` variable, redeploy the frontend.

---

# 🚀 Render Deployment

Create a Render Web Service.

For the monorepo:

```text
Root Directory:
backend
```

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Add:

```text
DATABASE_URL
JWT_SECRET
FRONTEND_URL
```

Use:

```text
FRONTEND_URL=https://crm-erp-sage.vercel.app
```

Render provides the production `PORT`, so it should normally not be hardcoded.

---

# 🗃️ Production Database Migration

When running migrations from your local computer against a cloud PostgreSQL database, use the **external database URL**.

PowerShell:

```powershell
cd backend
$env:DATABASE_URL="YOUR_EXTERNAL_DATABASE_URL"
node scripts/migrate.js
```

Then:

```powershell
node scripts/seed.js
```

For a Render backend connecting to a Render PostgreSQL database, configure the backend with the appropriate **internal database URL** when the services support internal connectivity.

Never commit the production database URL.

---

# 🧪 Testing

## Backend

```bash
npm start
```

Open:

```text
http://localhost:5000/
```

## Health

```text
http://localhost:5000/api/health
```

## Login

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Production Health

```text
https://crm-erp-uo8j.onrender.com/api/health
```

---

# 🛠️ Troubleshooting

## `Cannot GET /`

Add a root Express route:

```javascript
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "CRM Backend API is running"
  });
});
```

---

## `404 /auth/login`

Verify that the backend mounts:

```javascript
app.use("/auth", authRoutes);
```

and the router contains:

```javascript
router.post("/login", ...);
```

The current login endpoint is:

```text
POST /auth/login
```

---

## CORS Error

Verify:

```env
FRONTEND_URL=https://crm-erp-sage.vercel.app
```

Do not add a trailing `/`.

Also verify Vercel:

```env
VITE_API_URL=https://crm-erp-uo8j.onrender.com
```

---

## `500 Internal Server Error`

Check Render logs.

Common causes:

* Missing `DATABASE_URL`
* Missing `JWT_SECRET`
* Incorrect database credentials
* Missing database tables
* Database connection failure
* Incorrect environment variables

---

## `relation "users" does not exist`

The production database has not been migrated.

Run:

```bash
node scripts/migrate.js
```

Then:

```bash
node scripts/seed.js
```

---

# 🔒 Security

The application uses:

* JWT authentication
* bcrypt password hashing
* CORS
* HTTPS in production
* Environment variables
* Request validation
* Protected API routes

Never commit:

```text
.env
.env.local
.env.production
```

Never expose:

* Database passwords
* JWT secrets
* API keys
* Access tokens

---

# ⚠️ Known Limitations

The CRM currently requires an internet connection and is mainly designed for small and medium-sized businesses. Advanced features such as multi-factor authentication, offline access, real-time updates, advanced automation, AI-based analytics, and extensive third-party integrations are not currently implemented. Higher traffic and resource usage may also require upgrading the cloud infrastructure.

---

# 🔮 Future Enhancements

Planned or possible improvements include:

* Multi-factor authentication
* Advanced role-based access control
* Real-time notifications
* WebSocket integration
* AI-powered CRM insights
* Advanced analytics
* WhatsApp integration
* Email automation
* Payment gateway integration
* Automated reports
* Cloud file storage
* Automated backups
* CI/CD pipeline
* Advanced monitoring
* Audit logs
* Redis caching
* Advanced business intelligence

---

# 🔄 Development Workflow

```text
Developer
    ↓
GitHub
    ↓
Frontend ──────► Vercel
    │
    └── API ───► Render
                   │
                   ▼
               PostgreSQL
```

Recommended workflow:

```bash
git pull origin main

cd backend
npm install
node scripts/migrate.js
npm start
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

After testing:

```bash
git add .
git commit -m "Update CRM"
git push origin main
```

---

# 📊 System Summary

| Layer             | Technology   | Responsibility      |
| ----------------- | ------------ | ------------------- |
| User              | Browser      | Access application  |
| Frontend          | React        | User interface      |
| Language          | TypeScript   | Type safety         |
| Build Tool        | Vite         | Development/build   |
| Styling           | Tailwind CSS | Responsive UI       |
| API Client        | Axios        | HTTP communication  |
| Backend           | Node.js      | Server runtime      |
| Framework         | Express.js   | REST API            |
| Authentication    | JWT          | User authentication |
| Password Security | bcrypt       | Password hashing    |
| Validation        | Zod          | Request validation  |
| Database          | PostgreSQL   | Data storage        |
| Hosting           | Vercel       | Frontend            |
| Hosting           | Render       | Backend             |
| Version Control   | Git/GitHub   | Source management   |

---

# 👨‍💻 Author

**Chetan Sonawane**

Full-Stack Developer

### Technologies

React • TypeScript • Vite • Tailwind CSS • Node.js • Express.js • PostgreSQL • REST API • JWT • Git • GitHub • Cloud Deployment

---


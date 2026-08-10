# CRM-ERP

A modern **Customer Relationship Management (CRM) and Enterprise Resource Planning (ERP)** system built with a React frontend and Node.js/Express backend. The platform provides centralized management for customers, products, challans, authentication, and business operations.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* User registration and login
* Secure password hashing
* JWT-based authentication
* Protected API routes
* Role-based access control
* Persistent frontend authentication state

### 👥 Customer Management

* Create customers
* View customer list
* Update customer information
* Delete customers
* View customer details
* Customer validation

### 📦 Product Management

* Add products
* View products
* Update product information
* Delete products
* Product validation
* Product inventory-related information

### 🧾 Challan Management

* Create challans
* View challan list
* View challan details
* Update challans
* Manage customer/product information associated with challans
* Challan validation

### 📊 Dashboard

* Centralized business dashboard
* Quick access to CRM modules
* Navigation through customers, products and challans
* Protected dashboard routes

### 🎨 Modern Frontend

* React + TypeScript
* Vite
* Responsive layout
* Reusable components
* Protected routes
* Role-based routes
* API service layer
* Modern sidebar and topbar navigation

---

## 🏗️ Project Architecture

The project follows a monorepo structure:

```text
CRM_ERP/
│
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   │
│   ├── migrations/
│   │   └── 001_init.sql
│   │
│   ├── scripts/
│   │   ├── init-db.js
│   │   ├── migrate.js
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── challans.js
│   │   │   ├── customers.js
│   │   │   └── products.js
│   │   │
│   │   ├── validators/
│   │   │   ├── challan.js
│   │   │   ├── customer.js
│   │   │   └── product.js
│   │   │
│   │   └── index.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── challans.ts
│   │   │   ├── client.ts
│   │   │   ├── customers.ts
│   │   │   └── products.ts
│   │   │
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AppLayout.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Topbar.tsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── challans/
│   │   │   ├── customers/
│   │   │   ├── products/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Login.tsx
│   │   │
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── RoleRoute.tsx
│   │   │   └── router.tsx
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend

| Technology      | Purpose                   |
| --------------- | ------------------------- |
| React           | UI development            |
| TypeScript      | Type safety               |
| Vite            | Development/build tooling |
| React Router    | Application routing       |
| CSS             | Styling                   |
| Fetch/API layer | Backend communication     |

### Backend

| Technology | Purpose             |
| ---------- | ------------------- |
| Node.js    | Runtime             |
| Express.js | REST API            |
| PostgreSQL | Relational database |
| `pg`       | PostgreSQL client   |
| JWT        | Authentication      |
| bcrypt     | Password hashing    |

### Development Tools

* Git
* GitHub
* VS Code
* pgAdmin
* Postman / API testing tools

---

# 📋 Prerequisites

Before running the project, install:

* Node.js 18+
* npm
* PostgreSQL
* pgAdmin 4
* Git

Check your Node.js version:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

# 🗄️ PostgreSQL Setup

The project uses **local PostgreSQL**, not Supabase.

Open pgAdmin and create a database:

```text
Database Name: crm_erp
```

Alternatively, create it using SQL:

```sql
CREATE DATABASE crm_erp;
```

Verify the database exists:

```sql
SELECT datname
FROM pg_database;
```

---

# ⚙️ Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
copy .env.example .env
```

For macOS/Linux:

```bash
cp .env.example .env
```

Configure `.env`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_erp
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

JWT_SECRET=your_secure_jwt_secret
```

> Never commit your real `.env` file to GitHub.

---

# 🗃️ Initialize Database

The project contains database schema and initialization scripts.

Run the database initialization:

```bash
npm run db:init
```

If migrations are configured:

```bash
npm run migrate
```

For development seed data:

```bash
npm run seed
```

You can also execute:

```text
backend/database/schema.sql
```

directly from pgAdmin Query Tool if required.

---

# ▶️ Start Backend

From the `backend` directory:

```bash
npm start
```

The API will run on:

```text
http://localhost:5000
```

Expected output:

```text
Server running on port 5000
Database connected successfully.
```

---

# 💻 Frontend Setup

Open another terminal.

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide a local URL, usually:

```text
http://localhost:5173
```

---

# 🔗 Frontend + Backend

During local development:

```text
React Frontend
      │
      │ HTTP Requests
      ▼
Express API
      │
      │ SQL Queries
      ▼
PostgreSQL
```

Typical setup:

```text
Frontend → http://localhost:5173
Backend  → http://localhost:5000
Database → localhost:5432
```

The frontend API client should point to the backend API:

```text
http://localhost:5000
```

---

# 🔑 Authentication

The application uses token-based authentication.

Typical authentication flow:

```text
User
 │
 ▼
Login Page
 │
 ▼
POST /api/auth/login
 │
 ▼
Express Backend
 │
 ▼
PostgreSQL
 │
 ▼
JWT Token
 │
 ▼
Frontend
```

Protected API requests include the authentication token.

---

# 📡 API Modules

The backend currently contains API routes for:

### Authentication

```text
/api/auth
```

### Customers

```text
/api/customers
```

### Products

```text
/api/products
```

### Challans

```text
/api/challans
```

Example:

```http
GET /api/customers
```

Create a customer:

```http
POST /api/customers
```

Get products:

```http
GET /api/products
```

Get challans:

```http
GET /api/challans
```

Authentication:

```http
POST /api/auth/login
```

---

# 🧪 API Testing

You can test the backend using:

* Postman
* VS Code REST Client
* `backend/api.http`

Start the backend first:

```bash
npm start
```

Then execute the API requests.

---

# 🔒 Security

The project follows basic security practices:

* Password hashing using bcrypt
* JWT authentication
* Protected API routes
* Environment variables for secrets
* PostgreSQL parameterized queries
* Input validation
* `.env` excluded from Git

Never commit:

```text
.env
```

or database passwords/secrets.

---

# 🌱 Development Workflow

Clone the repository:

```bash
git clone https://github.com/chetan9130/CRM_ERP.git
```

Enter the project:

```bash
cd CRM_ERP
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Run backend:

```bash
cd ../backend
npm start
```

Run frontend in another terminal:

```bash
cd frontend
npm run dev
```

---

# 📌 Environment Variables

Backend `.env`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_erp
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

JWT_SECRET=YOUR_SECRET
```

Frontend environment variables can be added according to the API configuration used by the application.

---

# 🧩 Future Improvements

Planned improvements may include:

* Advanced analytics dashboard
* Sales and revenue reports
* Inventory management
* Invoice generation
* PDF challan generation
* Email notifications
* User and permission management
* Advanced search and filtering
* Export reports to Excel/PDF
* Audit logs
* Cloud deployment
* Automated database migrations
* Docker support

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git clone https://github.com/chetan9130/CRM_ERP.git
```

### 2. Create a branch

```bash
git checkout -b feature/your-feature
```

### 3. Make your changes

### 4. Commit

```bash
git add .
git commit -m "Add your feature"
```

### 5. Push

```bash
git push origin feature/your-feature
```

### 6. Open a Pull Request

---

# 👨‍💻 Author

**Chetan Sonawane**

GitHub:

https://github.com/chetan9130

---


**CRM-ERP — One platform for managing customers, products, challans, and business operations.**

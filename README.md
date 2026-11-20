# 🏛️ MuseumPass — Digital Museum Ticket Booking Platform

A full-stack, responsive web application for exploring museums, booking tickets with guest management, simulating secure checkouts, and providing an operator admin dashboard for museum management.

Built with **Django REST Framework (Python)** on the backend, **React 19 + Vite** on the frontend, and backed by a cloud **PostgreSQL** database.

---

## 🌐 Live Deployments

- **Frontend (Vercel):** [https://museum-sandy-phi.vercel.app](https://museum-sandy-phi.vercel.app)
- **Backend API (Render):** [https://museum-xh7f.onrender.com/api](https://museum-xh7f.onrender.com/api)
- **Database:** Cloud PostgreSQL (Prisma Accelerate / Direct SSL)

---

## ✨ Features

### 👤 For Visitors / Regular Users
- **JWT Authentication:** Simple email & password sign-up and sign-in with automatic token refresh.
- **Museum Discovery:** Browse featured museums with real-time operational status, location, operating hours, and ticket pricing.
- **Group Bookings with Guest Names:**
  - Book tickets for yourself and invite **up to 3 guests** (max 4 tickets total per transaction).
  - Dynamically inputs and validates each visitor's name.
  - Automatically pre-fills the logged-in user's name as the primary visitor.
- **Instant Digital Tickets:**
  - Simulated checkout flow generating unique UUID-based Ticket IDs.
  - "My Tickets" personal dashboard showing upcoming visits, status badges, price breakdown, and visitor lists.

### 🛡️ For Museum Operators / Admins
- **Role-Based Access Control:** Separate permissions for regular users vs. museum operators (`role: 'admin'`).
- **Museum Listing Creation:**
  - Dedicated form to list new museums (name, description, location, cover image, ticket price, opening/closing hours).
  - Each museum is linked directly to its creating operator (`operator_id`).
- **Scoped Operator Dashboard:**
  - Operators **only see bookings for their own museums** (guaranteeing multi-tenant data privacy).
  - Real-time KPI metric cards: *My Museums Listed*, *Total Bookings Received*, *Total Visitors*, and *Total Revenue*.
  - **Comprehensive Multi-Field Search:** Filter bookings instantly by:
    - Visitor name (including guest names)
    - Primary booker name or email
    - Ticket ID / Reference ID
    - Visit Date filter (`YYYY-MM-DD`)
    - Museum filter dropdown

### 🎨 Design & UX
- **Apple & Material Design Fusion:**
  - Deep dark grey aesthetic (`#0C0C0E` / `#17171B`) in Dark Mode and clean neutral (`#F8F9FA` / `#FFFFFF`) in Light Mode.
  - Generous squircle radii (`--radius-xl`, `--radius-full`), frosted glass navbars, and tactile pill-shaped action buttons.
  - Vibrant accent palette inspired by iOS controls (Ocean Teal, Electric Lime, Slate Sage, and Warm Amber).
- **Theme Switcher:** Instant Dark / Light mode toggle with automatic system preference detection and `localStorage` persistence.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, React Router v7, Axios, React Hot Toast, Plus Jakarta Sans & Inter |
| **Backend** | Python 3.12, Django 6.1, Django REST Framework (DRF), `django-cors-headers`, `djangorestframework-simplejwt` |
| **Production Server** | Gunicorn, WhiteNoise (static asset compression & caching) |
| **Database** | PostgreSQL (relational schema with JSONB support for visitor arrays) via `psycopg2-binary` & `dj-database-url` |
| **Deployment** | Vercel (Frontend SPA) + Render (Backend Web Service) |

---

## 📁 Repository Structure

```text
museum/
├── backend/                       # Django REST API
│   ├── accounts/                  # Custom User model (role: user/admin), auth & profile
│   ├── bookings/                  # Ticket bookings, guest list validation & payments
│   ├── museums/                   # Museum listings & operator management
│   ├── config/                    # Django settings, URLs, WSGI
│   ├── build.sh                   # Render deployment build script
│   ├── requirements.txt           # Pinned Python dependencies
│   └── .env.example               # Backend environment template
├── frontend/                      # React + Vite application
│   ├── public/                    # Favicons & static assets
│   ├── src/
│   │   ├── components/            # Navbar, ProtectedRoute
│   │   ├── context/               # AuthContext (JWT), ThemeContext (Dark/Light)
│   │   ├── pages/                 # Home, Login, Register, MuseumDetail, Payment, Tickets, AdminDashboard
│   │   ├── api.js                 # Axios API client with interceptors
│   │   ├── App.jsx                # Router & toast configuration
│   │   └── index.css              # Apple/Material design token system & styles
│   ├── vercel.json                # Vercel SPA client-side rewrite configuration
│   └── .env.example               # Frontend environment template
└── RENDER_DEPLOYMENT.md           # Step-by-step production deployment guide
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.11+) & pip
- PostgreSQL (or local SQLite fallback)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, or use default SQLite for local testing

# Run database migrations
python manage.py migrate

# Seed dummy museum listings
python manage.py seed_museums

# Start development server
python manage.py runserver 0.0.0.0:8000
```
Backend API will be running at: `http://localhost:8000/api`

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory in a new terminal
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start Vite dev server
npm run dev
```
Frontend application will be running at: `http://localhost:5173/`

---

## 📡 API Reference Overview

### Authentication (`/api/auth/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register as a Visitor (`user`) or Museum Operator (`admin`) | Public |
| `POST` | `/api/auth/login/` | Obtain JWT Access and Refresh tokens | Public |
| `POST` | `/api/auth/refresh/` | Refresh expired access token | Public |
| `GET` | `/api/auth/profile/` | Fetch current logged-in user profile | Authenticated |

### Museums (`/api/museums/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/museums/` | List all active museums | Public |
| `GET` | `/api/museums/<id>/` | Get detailed museum info | Public |
| `POST` | `/api/museums/` | Create a new museum listing | Operator (`admin`) |
| `GET` | `/api/museums/my/` | List museums created by the logged-in operator | Operator (`admin`) |
| `PATCH/DELETE` | `/api/museums/<id>/` | Modify or delete museum | Managing Operator |

### Bookings (`/api/bookings/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/bookings/` | Create booking (validates 1–4 tickets & guest names) | Authenticated |
| `GET` | `/api/bookings/my/` | List tickets booked by current user | Authenticated |
| `GET` | `/api/bookings/<id>/` | View single ticket details | Ticket Owner |
| `POST` | `/api/bookings/<id>/pay/` | Simulate payment & confirm ticket | Ticket Owner |
| `GET` | `/api/bookings/admin/all/` | Operator dashboard: view & search bookings for own museums | Operator (`admin`) |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```ini
SECRET_KEY=your-secure-django-secret-key
DEBUG=True
ALLOWED_HOSTS=*
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=https://museum-xh7f.onrender.com/api
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

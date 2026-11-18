# Museum Ticket Booking Platform — Render Deployment Guide

This project consists of two services on Render:
1. **Backend Web Service (Django + Gunicorn)**
2. **Frontend Static Site (Vite + React)**

---

## 1. Backend Web Service (Django)

In your [Render Dashboard](https://dashboard.render.com):
1. Click **New +** > **Web Service**.
2. Connect your Git repository.
3. Configure the settings:
   - **Name**: `museum-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn config.wsgi:application`

4. Add **Environment Variables** in Render:
   - `DATABASE_URL`: `postgres://68e8dc7479643b7a3c4b5e884105e3e15926bbe6daf44926bb26d6d565049127:sk_wFZbnmghoT0gl6mPZyXkr@db.prisma.io:5432/postgres?sslmode=require` (or your Prisma/Postgres URI)
   - `SECRET_KEY`: *Any random secure string*
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `*` (or your Render domain, e.g. `museum-backend.onrender.com`)
   - `PYTHON_VERSION`: `3.12.0`

5. Click **Create Web Service**. Render will run `build.sh` (installs dependencies, runs `collectstatic`, and runs migrations) and boot up Gunicorn.
6. Note down your backend URL (e.g., `https://museum-backend.onrender.com`).

---

## 2. Frontend Static Site (React + Vite)

In your [Render Dashboard](https://dashboard.render.com):
1. Click **New +** > **Static Site**.
2. Connect the same Git repository.
3. Configure the settings:
   - **Name**: `museum-frontend` (or your choice)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add **Environment Variables** in Render:
   - `VITE_API_URL`: `https://your-backend-app-name.onrender.com/api` *(Make sure to include `/api` at the end)*

5. Set up Single Page App (SPA) rewrite rule:
   - Go to **Redirects/Rewrites** in the service settings.
   - Add Rewrite:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`

6. Click **Create Static Site**.

---

## Local Development
- **Backend**:
  ```bash
  cd backend
  source venv/bin/activate
  python manage.py runserver 0.0.0.0:8000
  ```
- **Frontend**:
  ```bash
  cd frontend
  npm run dev
  ```

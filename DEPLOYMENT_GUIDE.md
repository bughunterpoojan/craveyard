# Deployment Guide: Vercel (Frontend) & Render (Backend)

This repository is configured for production deployment:
- **Backend**: Django REST Framework on [Render](https://render.com) using Gunicorn and WhiteNoise.
- **Frontend**: React + Vite SPA on [Vercel](https://vercel.com).

---

## 1. Push Your Project to GitHub

If you haven't initialized a Git repository yet, run the following in your project root folder:

```bash
git init
git add .
git commit -m "feat: setup production deployment for Render and Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

---

## 2. Deploy Backend on Render

You can deploy using either **Option A (Manual)** or **Option B (Blueprint)**.

### Option A: Manual Web Service Setup (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `craveyard-backend` (or any name you prefer)
   - **Region**: Closest to your users (e.g., Singapore / Frankfurt / Oregon)
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn craveyard.wsgi:application`
   - **Instance Type**: `Free`
4. Expand **Environment Variables** and add:
   - `PYTHON_VERSION`: `3.11.9`
   - `DEBUG`: `False`
   - `SECRET_KEY`: *Click "Generate" or paste a random secret key*
   - `ALLOWED_HOSTS`: `*`
5. Click **Create Web Service**.
6. Once deployed, copy your backend service URL (e.g., `https://craveyard-backend.onrender.com`).

> **Note on Database**: By default, the application runs on SQLite with automatic menu seeding. If you prefer persistent PostgreSQL, create a **Free PostgreSQL** database on Render and set the `DATABASE_URL` environment variable in your web service.

---

### Option B: Blueprint Setup (1-Click)
1. In the Render Dashboard, click **New +** > **Blueprint**.
2. Select your repository.
3. Render will automatically read [`render.yaml`](./render.yaml) and configure the build command, start command, and environment variables.

---

## 3. Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** > **Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://craveyard-backend.onrender.com` *(Replace with your Render backend URL from Step 2, without a trailing slash)*
5. Click **Deploy**.

---

## 4. Final Touch: Set Frontend URL in Render (Optional)

In your Render backend service, under **Environment**:
- Add `FRONTEND_URL`: `https://your-app-name.vercel.app`

This explicitly whitelists your Vercel domain for CORS and CSRF protection.

---

## 5. Local Development Quick Reference

To run locally with the same settings:

**Backend**:
```bash
cd backend
python manage.py migrate
python manage.py runserver 8000
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```
*(In local development, Vite automatically proxies `/api` calls to `http://127.0.0.1:8000`).*

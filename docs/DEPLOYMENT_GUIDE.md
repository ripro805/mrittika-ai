# Mrittika AI Deployment Guide (Render & Vercel)

## 1. Production Architecture Overview
- **Frontend**: Single Page Application (React 18 / Vite / Tailwind) deployed on **Vercel**.
- **Backend API**: Django 5 REST Framework running under Gunicorn/Uvicorn on **Render**.
- **Database**: Serverless PostgreSQL 16 on **Neon Cloud Database**.
- **Model Storage**: Hugging Face Hub (`ripro805/mrittika-ai`).

---

## 2. Render Backend Web Service Configuration
- **Live URL**: `https://mrittika-backend.onrender.com`
- **Build Command**:
  ```bash
  pip install --upgrade pip && pip install -r requirements.txt && python manage.py migrate
  ```
- **Start Command**:
  ```bash
  gunicorn mrittika.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
  ```

### Backend Environment Variables (`backend/.env` on Render)
```env
DEBUG=False
SECRET_KEY=k8br4KqQM4sSnJxe2-GcqekIf-E_dCn-VFy3VYUEZXujXcCMgv6Pm6waFclz9feIZfM
ALLOWED_HOSTS=.onrender.com,localhost,127.0.0.1
DATABASE_URL=postgresql://neondb_owner:npg_tmDf2OrHL3gJ@ep-fancy-queen-ar8i3unw-pooler.c-4.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
CSRF_TRUSTED_ORIGINS=https://your-app.vercel.app,https://mrittika-backend.onrender.com
AUTH_COOKIE_NAME=mrittika_refresh_token
AUTH_COOKIE_SAMESITE=None
AUTH_COOKIE_SECURE=True
HF_REPO_ID=ripro805/mrittika-ai
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
OPEN_METEO_API_URL=https://api.open-meteo.com/v1/forecast
```

> [!IMPORTANT]
> Ensure the Render URL uses two 't's: `https://mrittika-backend.onrender.com`. Visiting `https://mrttika-backend.onrender.com` (one 't') will return a `404 Not Found` error.

---

## 3. Vercel Frontend Configuration
- **Root Directory**: `frontend`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Frontend Environment Variables (`frontend/.env` on Vercel)
```env
VITE_API_BASE_URL=https://mrittika-backend.onrender.com/api/v1
VITE_APP_NAME="Mrittika AI"
VITE_APP_VERSION="1.0.0"
VITE_ENABLE_VOICE_INPUT=true
VITE_ENABLE_SAMPLE_BADGES=true
```

### SPA Routing Fallback (`frontend/vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

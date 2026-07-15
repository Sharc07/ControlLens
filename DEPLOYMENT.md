# ControlLens deployment

## Local development

1. Create a PostgreSQL database (or use the default local SQLite database for a quick smoke test).
2. In `backend`, copy `.env.example` to `.env`, set `DATABASE_URL`, `SECRET_KEY`, and `CORS_ORIGINS=http://localhost:5173`.
3. Create and activate a Python 3.12 virtual environment, then run `pip install -r requirements.txt` and `alembic upgrade head`.
4. Start the API: `uvicorn app.main:app --reload --port 8000`.
5. At the repository root, copy `.env.example` to `.env`, run `npm install`, then `npm run dev`.

The UI uses `VITE_API_URL`, defaulting to `http://localhost:8000`. Upload a CSV in Data Profiling, then call `POST /audit/run/{dataset_id}` (or use an API client) to produce findings. The dashboard endpoints are available at `/dashboard/summary`, `/datasets`, and `/findings`.

## Neon PostgreSQL

1. Create a project and database in Neon.
2. Copy the connection string from Neon and set Render's `DATABASE_URL` to it, replacing `postgresql://` with `postgresql+psycopg://` if necessary.
3. Include `?sslmode=require` in the connection string.

## Render backend

1. Push this repository to GitHub and create a Render **Web Service** from it.
2. Set the root directory to `backend`, runtime to Docker, and Dockerfile path to `./Dockerfile`.
3. Add `DATABASE_URL`, a strong random `SECRET_KEY`, and `CORS_ORIGINS` (your eventual Vercel URL) as environment variables.
4. Deploy. The Docker command runs `alembic upgrade head` before starting Uvicorn.
5. Confirm `https://YOUR-RENDER-SERVICE/health` returns `{"status":"ok"}`.

## Vercel frontend

1. Import the same repository in Vercel. Set the root directory to the repository root.
2. Vercel detects Vite; use `npm run build` and output directory `dist`.
3. Set `VITE_API_URL=https://YOUR-RENDER-SERVICE` (no trailing slash).
4. Deploy, then update Render `CORS_ORIGINS` with the exact Vercel deployment domain and redeploy Render.
5. Verify that a CSV upload succeeds and `/dashboard/summary` shows the API result in your browser's Network panel.

## Production follow-ups

- Configure a managed object store for original CSV files rather than retaining parsed rows in the database.
- Add authenticated route dependencies and user/dataset ownership checks before exposing multi-tenant data.
- Add rate limits, structured logging, monitoring, backups, and a CI workflow that runs migration and API tests.
- Use a transaction-aware CSV parser and schema-specific validation for large or sensitive files.

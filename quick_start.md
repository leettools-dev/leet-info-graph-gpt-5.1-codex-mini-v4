# Quick Start

## Environment Requirements
- **Python 3.12+** (for FastAPI backend).
- **Node 20+** (for Next.js frontend).
- **Docker & Docker Compose** (for containerized end-to-end runs).
- **Environment variables** configurable via `.env` (copy `.env.sample` as starting point).

**Required variables** (placeholders in `.env.sample`):
| Variable | Description |
| --- | --- |
| `BACKEND_PORT` | Port exposed by the FastAPI service (default `8000`). |
| `FRONTEND_PORT` | Port exposed by the Next.js frontend (default `3000`). |
| `GOOGLE_CLIENT_ID` | OAuth client id placeholder for future Google sign-in integration. |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret placeholder. |

## Startup Scripts
Startup and teardown are handled by `start.sh` / `stop.sh`. Logs are written under `logs/` and PIDs are stored in `pids/`.

```bash
./start.sh   # stops existing services, launches backend + frontend, prints access URLs
./stop.sh    # stops running services gracefully using stored PIDs
```

Both scripts create `logs/` & `pids/` automatically when needed. Logs are appended to `logs/backend.log` and `logs/frontend.log` for easier inspection.

## Frontend Access
After running `./start.sh`, the script prints:
```
Frontend: http://localhost:${FRONTEND_PORT:-3000}
Backend API: http://localhost:${BACKEND_PORT:-8000}
```
Visit the frontend URL to see the Research Infographic Studio landing page and confirm the backend health check.

## CLI Quick Intro
| Command | Purpose |
| --- | --- |
| `./start.sh` | Build (if needed) and launch backend + frontend; writes PID files under `pids/`. |
| `./stop.sh` | Gracefully stop services by killing PIDs recorded during `start.sh`. |
| `tail -f logs/backend.log` | Stream backend logs during development runs. |
| `tail -f logs/frontend.log` | Stream frontend logs (Next.js dev server). |
| `docker compose up --build` | Alternative: run the full stack via Docker Compose. |
| `docker compose down` | Tear down the containerized stack started by Docker Compose. |

## Notes
- Keep `.env` out of source control; use the `.env.sample` placeholders and update with real credentials in private copies.
- `start.sh` relies on dependencies being installed (`pip install -r backend/requirements.txt` and `npm install` inside `frontend`). Run these once before invoking the script locally.

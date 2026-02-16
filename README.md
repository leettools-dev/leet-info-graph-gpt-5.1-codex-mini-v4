# Research Infographic Studio

> Reduce the time from question to a shareable, cited infographic + article.

## Overview

Research Infographic Studio is a full-stack research companion that transforms a single prompt into an AI-generated infographic, a structured explanatory article, and a traceable citation bundle. Users sign in with Google, submit prompts, and receive a fully cited result package plus a searchable history that can be refined, revisited, and exported in PNG, Markdown, JSON, or CSV formats.

## Features

<<<<<<< HEAD
- Instant shareable package caching ensures exports download immediately after a job completes, reducing the time to go from question to shareable infographic + article.

=======
- Added in-product hero, prompt editor, and export instructions that describe how Research Infographic Studio turns a single prompt into a shareable infographic, article, and citation package.
>>>>>>> dev#feature#product-name-working-research-infographic-studio
## Getting Started

### Prerequisites

<<<<<<< HEAD
- Environment variables (`.env.sample`) now include placeholders for `BACKEND_PORT`, `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, and Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) so authentication and networking can be configured without exposing secrets.
=======
- Python 3.12+ (backend FastAPI service)
- Node 20+ (Next.js App Router frontend)
- Docker & Docker Compose (end‑to‑end runs)
- `.env` file (copy `.env.sample` and fill in placeholders for `BACKEND_PORT`, `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`)
>>>>>>> dev#feature#product-name-working-research-infographic-studio

### Installation

```bash
pip install -r backend/requirements.txt
cd frontend && npm install
```

### Local Development

```bash
./start.sh          # starts backend + frontend, stops previously running services, and prints frontend/api URLs
./stop.sh           # stops services via PID files in pids/ and writes feedback to stdout
```

`start.sh` creates `logs/` for backend and frontend output and writes PID files to `pids/` so services can be reliably restarted. See `quick_start.md` for full environment, logging, and export guidance.

<<<<<<< HEAD
- Run `docker compose up` to boot the backend and frontend containers defined in `docker-compose.yml`.
- Use `COMPOSE_PROJECT_NAME` or the default prefixes to keep container names consistent with your development environment.
- Ensure `.env` provides `BACKEND_PORT`, `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` before starting the stack.

### Docker 🐳
=======
### Docker
>>>>>>> dev#feature#product-name-working-research-infographic-studio

```bash
docker compose up --build
```

The provided `docker-compose.yml` builds both services, binds ports (8000 backend, 3000 frontend), and loads `.env.sample`. Use `docker compose down` to tear down the stack.

## Testing

Run the backend test suite before committing:

```bash
cd backend && pytest tests
```

## Documentation & Quick Start

- `quick_start.md` (already populated) covers environment variables, `start.sh`/`stop.sh`, logging output, and export expectations for Research Infographic Studio.
- REST endpoints are defined in `backend/app/main.py`; the frontend consumes `/product-info`, `/research-jobs`, and `/research-jobs/{job_id}/package` to showcase product metadata and shareable bundles.

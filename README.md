# Research Infographic Studio

> Reduce the time from question to a shareable, cited infographic + article.

## Overview

Research Infographic Studio is a full-stack research companion that transforms a single prompt into an AI-generated infographic, a structured explanatory article, and a traceable citation bundle. Users sign in with Google, submit prompts, and receive a fully cited result package plus a searchable history that can be refined, revisited, and exported in PNG, Markdown, JSON, or CSV formats.

## Product Identity

**Product name (working):** Research Infographic Studio

Focused on answering the “question → shareable, cited infographic + article” cycle, the Research Infographic Studio name anchors every customer story, metric, and export bundle. The product information endpoint (`/product-info`) keeps the frontend, documentation, and activation dashboards in sync with the latest vision, goals, and architecture narrative so the name stays meaningful across releases and campaigns.

### Success metrics snapshot

- **Activation:** ≥ 40% of signed-in users generate at least one research result (tracked via `/activation/metrics`).
- **Time-to-first-result:** Median ≤ 90 seconds for a standard prompt so that the name reflects instant insight.
- **Export rate:** ≥ 20% of completed results exported once, reinforcing the promise of shareable outputs.
- **Citation coverage:** ≥ 90% of factual claims tied to sources so the name stays synonymous with trustworthy storytelling.

## Features

- History & refine refinements now live in the UI so everyone can revisit past jobs, open their detail views, and click “Refine” to evolve prompts, audiences, tones, citation styles, and counterpoint preferences before generating a new version.
- Export buttons now hit dedicated PNG/Markdown endpoints so users can grab shareable assets straight from the frontend without downloading the entire package.
- Trust and provenance metadata (confidence_level, average reliability, and timestamped provenance records) travels with every job so the same citation IDs that appear in the article and infographic appear inside `trust.json`, `sources.json`, and the UI before a result is shared.

### Usage example

1. Generate a research job through the UI or `POST /research-jobs` with your prompt.
2. Download the resulting bundle with `curl -o research-package.zip http://localhost:8000/research-jobs/<job_id>/package` and open `trust.json` to confirm the confidence note, source IDs, and provenance phase summaries match the inline citations you rely on.
## Getting Started

### Prerequisites

- Python 3.12+ (backend FastAPI service)
- Node 20+ (Next.js App Router frontend)
- Docker & Docker Compose (end-to-end runs)
- Environment variables (`.env.sample`) now include placeholders for `BACKEND_PORT`, `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, and Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) so authentication and networking can be configured without exposing secrets.

### Getting Started

- Clone the repo and copy `.env.sample` to `.env`, filling in backend/frontend ports (default 8000/3000), `NEXT_PUBLIC_API_URL`, and Google OAuth placeholders before running services.

### Installation

- Install backend dependencies with `pip install -r backend/requirements.txt` and frontend dependencies via `cd frontend && npm install` to satisfy the Research Infographic Studio stack.
### Local Development

```bash
./start.sh          # starts backend + frontend, stops previously running services, and prints frontend/api URLs
./stop.sh           # stops services via PID files in pids/ and writes feedback to stdout
```

`start.sh` creates `logs/` for backend and frontend output and writes PID files to `pids/` so services can be reliably restarted. See `quick_start.md` for full environment, logging, and export guidance.

### Docker

- Run `docker compose up` to boot the backend and frontend containers defined in `docker-compose.yml`.
- Use `COMPOSE_PROJECT_NAME` or the default prefixes to keep container names consistent with your development environment.
- Ensure `.env` provides `BACKEND_PORT`, `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` before starting the stack.

```bash
docker compose up --build
```

The provided `docker-compose.yml` builds both services, binds ports (8000 backend, 3000 frontend), and loads `.env.sample`. Use `docker compose down` to tear down the stack.

## Testing

- Backend pytest suite covering research job creation, article structure, citation integrity, and shareable package exports (`cd backend && pytest tests`).

## Documentation & Quick Start

- `quick_start.md` (already populated) covers environment variables, `start.sh`/`stop.sh`, logging output, and export expectations for Research Infographic Studio.
- REST endpoints are defined in `backend/app/main.py`; the frontend consumes `/product-info`, `/research-jobs`, and `/research-jobs/{job_id}/package` to showcase product metadata and shareable bundles.

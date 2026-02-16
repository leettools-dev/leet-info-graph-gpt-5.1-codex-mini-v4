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

- Guided prompt composer with audience, tone, citation style, and counterpoint controls that turn questions into structured research jobs ready for AI processing.
- Trusted research pipeline that combines curated sources, provenance tracking, and reliability scoring to keep citations accurate and traceable.
- Article + infographic generation that produces a structured narrative alongside timeline, comparison, and callout visual blocks complete with citation markers.
- Shareable history, versioning, and export bundles (PNG, Markdown, JSON, CSV) so every insight can be revisited, refined, or handed off for publication.
- Activation insights surface the 40% activation target for signed-in users and guide teams toward generating more valuable research.

## Getting Started

### Prerequisites

- Python 3.12+ (backend FastAPI service)
- Node 20+ (Next.js App Router frontend)
- Docker & Docker Compose (end-to-end runs)
- `.env` file (copy `.env.sample` and fill in placeholders for `BACKEND_PORT`, `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`)

### Getting Started

- Clone the repo and copy `.env.sample` to `.env`, filling in backend/frontend ports (default 8000/3000), `NEXT_PUBLIC_API_URL`, and Google OAuth placeholders before running services.

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

### Docker

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

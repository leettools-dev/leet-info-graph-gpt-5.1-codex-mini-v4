# leet-info-graph-gpt-5.1-codex-mini-v4

> This project is being developed by an autonomous coding agent.

## Overview

## Product Requirements Document (PRD)

**Product name (working):** Research Infographic Studio

---

### 1) Summary

Build a full-stack web application where users sign in with Google, submit researc...

## Features

- Added Docker Compose orchestration for backend and frontend along with health checks.

## Getting Started

### Prerequisites

- Python 3.12+ (backend) and Node 20+ (frontend).
- Docker & Docker Compose for full-stack runs.
- Copy `.env.sample` to `.env` and define the placeholders: `BACKEND_PORT`, `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
### Installation

```bash
pip install -r backend/requirements.txt
cd frontend && npm install
./start.sh
```

# Installation instructions will be added
```

### Usage

```
./start.sh   # stops existing services, launches backend + frontend, prints access URLs
./stop.sh    # stops running services gracefully using stored PIDs
```
# Usage examples will be added
```

## Development

- Backend tests now assert the shareable ZIP contains markdown, JSON, and CSV slices so we can validate reliable outputs before sharing.
- Frontend exposes a “Download shareable package” CTA that hits the new endpoint and saves the bundle locally so the user can immediately share infographic/article/citations together.
- Documented the shareable bundle feature and export instructions for the Research Infographic Studio quick start flow.
- Added Next.js `layout.tsx`, `globals.css`, and `next-env.d.ts` artifacts to satisfy the App Router expectations while keeping the UI theme consistent.
- Added frontend trust callouts that highlight confidence, citation reliability, and provenance context to help users assess the credibility of each result.

## Testing

- Run `docker compose up` to start both services and `docker compose down` to stop them.

# Test instructions will be added
```

## License

MIT

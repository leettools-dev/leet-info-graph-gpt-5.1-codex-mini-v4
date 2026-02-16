# leet-info-graph-gpt-5.1-codex-mini-v4

> This project is being developed by an autonomous coding agent.

## Overview

## Product Requirements Document (PRD)

**Product name (working):** Research Infographic Studio

---

### 1) Summary

Build a full-stack web application where users sign in with Google, submit researc...

## Features

- Strengthened the supporting sources workflow by generating five fully described sources per research job (title, publisher, URL, publish date, access timestamp, snippets, and reliability scores), expanding the infographic spec to consume these references, and validating the outputs via new backend tests so the citations map to actual metadata.
- Updated the README and quick start guidance to highlight how users get citation-aware article exports with metadata-rich sources lists and downloadable bundles that include CSV/JSON slices to inspect every citation.
## Getting Started

### Prerequisites

- Environment variables (`.env.sample`) now include placeholders for `BACKEND_PORT`, `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, and Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) so authentication and networking can be configured without exposing secrets.
### Installation

```bash
pip install -r backend/requirements.txt
cd frontend && npm install
./start.sh
```

# Installation instructions will be added
```

### Usage

- Run a research job via `POST /research-jobs` with your prompt to receive an infographic, article, and metadata-rich sources list in the response.
- Visit the frontend landing page to craft prompts, view structured article sections, and click inline citation links that scroll to the numbered sources for quick verification.
- Download the shareable package to export article Markdown, infographic JSON/PNG, and sources CSV/JSON for auditing and offline sharing.
### Docker 🐳

- Run `docker compose up` to boot the backend and frontend containers defined in `docker-compose.yml`.
- Use `COMPOSE_PROJECT_NAME` or the default prefixes to keep container names consistent with your development environment.
- Ensure `.env` provides `BACKEND_PORT`, `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` before starting the stack.

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

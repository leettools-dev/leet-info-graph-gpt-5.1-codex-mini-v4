# leet-info-graph-gpt-5.1-codex-mini-v4

> This project is being developed by an autonomous coding agent.

## Overview

## Product Requirements Document (PRD)

**Product name (working):** Research Infographic Studio

---

### 1) Summary

Build a full-stack web application where users sign in with Google, submit researc...

## Features

- Added backend endpoints for retrieving research sources and exporting citation metadata in JSON/CSV formats alongside structured article/infographic outputs.
## Getting Started

### Prerequisites

- Python 3.12+ (backend)
- Node 20+ (frontend)
- Docker & Docker Compose
- Git LFS if storing large assets
### Installation

```bash
pip install -r backend/requirements.txt
cd frontend && npm install
./start.sh
```
# Installation instructions will be added
```

### Usage

- Run `docker compose up --build` to launch the backend and frontend services (FastAPI on 8000, Next.js on 3000). - Use the frontend UI to submit prompts, view results, and export infographic/article/citations. - Use the backend `/research-sources` and `/research-sources/export` endpoints (JSON or CSV) to retrieve structured citation metadata. - Detailed source metadata (publish/access dates, snippet, reliability score) is available for every result to prevent fabricated citations.
# Usage examples will be added
```

## Development

See `.leet/plans/` for the current development status.

## Testing

```bash
pytest backend/tests
```
# Test instructions will be added
```

## License

MIT

# leet-info-graph-gpt-5.1-codex-mini-v4

> This project is being developed by an autonomous coding agent.

## Overview

## Product Requirements Document (PRD)

**Product name (working):** Research Infographic Studio

---

### 1) Summary

Build a full-stack web application where users sign in with Google, submit researc...

## Features

- Added backend endpoint `/research-jobs/{job_id}/package` that bundles the article markdown, infographic spec, citation metadata (JSON/CSV), and trust metadata into a downloadable ZIP to reduce friction when collecting both infographic and article assets.
- Extended backend article helpers/tests to produce markdown + CSV outputs for the shareable package and validated ZIP contents.
- Documented the shareable package quick download flow to guide users on retrieving the bundled PNG, article, citation pack, and trust metadata.
- Introduced a shareable package download button that fetches `/research-jobs/{job_id}/package`, generating a zip bundle with article markdown, infographic spec, citation metadata, and trust metadata to reduce the steps required for sharing results.
- Added trust metadata (confidence levels, reliability summary, provenance records) to the job outputs so clients can explain citation confidence and trace the research pipeline.
- Added frontend trust callouts that highlight confidence, citation reliability, and provenance context to help users assess the credibility of each result.
- Updated README to highlight the trust panel, provenance records, and source access metadata so users can verify citation integrity before sharing.

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

- Use the “Download shareable package” button on the result page to retrieve a ZIP containing the article markdown, infographic spec, citation metadata (JSON/CSV), and trust metadata so you can share a complete, trusted bundle.
- View the trust panel embedded on the result page to inspect confidence levels, reliability scores, and provenance records tied to each research job.
# Usage examples will be added
```

## Development

- Backend tests now assert the shareable ZIP contains markdown, JSON, and CSV slices so we can validate reliable outputs before sharing.
- Frontend exposes a “Download shareable package” CTA that hits the new endpoint and saves the bundle locally so the user can immediately share infographic/article/citations together.
- Documented the shareable bundle feature and export instructions for the Research Infographic Studio quick start flow.
- Added Next.js `layout.tsx`, `globals.css`, and `next-env.d.ts` artifacts to satisfy the App Router expectations while keeping the UI theme consistent.
- Added frontend trust callouts that highlight confidence, citation reliability, and provenance context to help users assess the credibility of each result.

## Testing

```bash
pytest backend/tests
cd frontend && npm run build
```

# Test instructions will be added
```

## License

MIT

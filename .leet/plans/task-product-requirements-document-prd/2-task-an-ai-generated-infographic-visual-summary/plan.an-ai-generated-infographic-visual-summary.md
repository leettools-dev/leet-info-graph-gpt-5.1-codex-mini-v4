---
task_name: an-ai-generated-infographic-visual-summary
status: in_progress
created_at: '2026-02-15T18:21:53Z'
updated_at: '2026-02-15T19:50:00Z'
---

# Task: an-ai-generated-infographic-visual-summary

## Description

an **AI-generated infographic** (visual summary),

## Plan

1. Define backend data models plus a stubbed infographic generator that produces specs, sources, and article snippets, then expose endpoints for job creation and retrieval while applying CORS for the frontend.
2. Implement FastAPI tests covering the new research endpoints and infographic spec structure to ensure returned stories include citations, source metadata, and rendered SVG placeholders.
3. Build the Next.js landing page with a prompt editor, job progress stepper, infographic preview, source list, history browsing, and quick export buttons that rely on the generated spec.
4. Add development tooling (Dockerfiles for backend/frontend, docker-compose.yml, .env.sample, start.sh/stop.sh, logging/PID handling) so the stack can be run via scripts or docker compose, and document the experience.
5. Run the backend tests, npm install/build steps, and docker compose stack to verify the infographic pipeline, then update README/quick_start with the new CLI/docker guidance.

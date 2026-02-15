---
task_name: reduce-the-time-to-go-from-question-shareable-cited-infographic-article
status: done
created_at: '2026-02-15T18:21:53Z'
updated_at: '2026-02-16T00:00:00Z'
---

# Task: reduce-the-time-to-go-from-question-shareable-cited-infographic-article

## Description

Reduce the time to go from “question” → “shareable, cited infographic + article”.

## Plan

1. Add a backend helper that assembles a "shareable package" for a research job (article markdown, infographic spec, source metadata) and expose it via a new `GET /research-jobs/{job_id}/package` endpoint that streams a zip bundle. This keeps every shareable artifact together so the client can download it in one round trip.
2. Extend backend tests to request the package endpoint, unpack the zip in-memory, and assert that the bundled markdown, JSON, and CSV entries are present and cite the correct sources so we guard against regressions.
3. Update the result page on the frontend to surface a "Download shareable package" button that hits the new endpoint and saves the zip (reducing the manual steps needed to collect article, infographic, and citations separately).
4. Document the new shareable package feature and download flow in README/quick_start so users understand how to get a ready-to-share bundle without stitching assets themselves.
5. Run the existing pytest suite and verify the frontend still compiles (e.g., `npm run lint` or `npm run build`) before marking the subtask complete.

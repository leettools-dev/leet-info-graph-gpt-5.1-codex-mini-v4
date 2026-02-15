---
task_name: an-explanatory-article-structured-narrative
status: in_progress
created_at: '2026-02-15T18:21:53Z'
updated_at: '2026-02-15T20:00:00Z'
---

# Task: an-explanatory-article-structured-narrative

## Description

an **explanatory article** (structured narrative),

## Plan

1. Improve the backend article generation helpers to emit all required sections (Overview, Key points, Detailed explanation, Implications/applications, Limitations/uncertainties, Sources) and provide inline citation markers that reference the stored sources list without any broken references.
2. Extend the Pydantic models to include a structured confidence/uncertainty note and maintain consistent source indexing so the frontend can render `[1]`-style citations tied to the same list of ResearchSource entries.
3. Update the frontend to render the explanatory article sections, inline citations, a dedicated “Confidence / uncertainty notes” block, and an accessible Sources list where clicking a citation scrolls/references the corresponding source.
4. Add backend tests that assert article structure, citation coverage, and the absence of dangling citation references, ensuring the API contract supports the new frontend expectations.

## Acceptance Criteria

- Articles returned from `/research-jobs` include every required section with consistent citation indexing.
- Inline citations in `/research-jobs` map to the published sources list.
- Frontend displays the structured narrative with confidence notes and the annotated source list.

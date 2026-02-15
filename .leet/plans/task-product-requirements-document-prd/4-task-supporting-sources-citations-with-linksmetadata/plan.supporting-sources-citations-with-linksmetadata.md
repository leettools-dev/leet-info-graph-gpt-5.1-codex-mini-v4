---
task_name: supporting-sources-citations-with-linksmetadata
status: in_progress
created_at: '2026-02-15T18:21:53Z'
updated_at: '2026-02-15T20:05:00Z'
---

# Task: supporting-sources-citations-with-linksmetadata

## Description

supporting sources** (citations with links/metadata).

## Plan

1. Ensure the backend research sources generator populates rich metadata (publisher, publish/access dates, snippets, reliability, citation index) and expose a dedicated endpoint that returns the ordered sources for a research job.
2. Add an export helper on the backend that streams sources metadata in JSON or CSV formats so clients can download fully attributed citations.
3. Extend backend tests to cover the new sources endpoint/export helper, validating citation indexing and metadata completeness.
4. Update the frontend detail view to highlight source metadata, include access/publish dates and reliability badges, and provide buttons to download the citation pack in JSON/CSV directly from available data.
5. Document the sources support feature and export instructions in README and plan summary updates.

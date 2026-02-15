---
task_name: activation-40-of-signed-in-users-generate-at-least-1-research-result
status: in_progress
created_at: '2026-02-15T18:21:53Z'
updated_at: '2026-02-15T18:21:53Z'
---

# Task: activation-40-of-signed-in-users-generate-at-least-1-research-result

## Description

Activation:** ≥ 40% of signed-in users generate at least 1 research result.

## Plan

1. Expand the backend payloads to capture a pseudo user identifier on research job creation and synthesize activation statistics (percentage of unique users who generated jobs).
2. Expose a metrics endpoint that reports recent activation data, history counts, and a CTA suggestion to encourage first-job completion.
3. Update backend tests to cover the activation metrics calculations and the new endpoint.
4. Enhance the frontend landing page with an activation overview card, progress indicator, and quick CTA for new users.
5. Document the activation tracking feature along with the new usage guidance in README.md and quick_start.md if required.

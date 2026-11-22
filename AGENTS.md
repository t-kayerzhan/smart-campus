# Project

Smart Campus room availability checker with four fictional rooms, attendee/equipment filtering, a fixed current time, and an optional mock "Explain availability" feature (deterministic availability in booking.ts is always authoritative).

# Project Structure

- src/lib/booking.ts: pure availability validation logic (MAX_DURATION_MIN constant, NaN/Infinity guards). The ONLY source of truth for Available/Unavailable.
- src/lib/time.ts: time conversion helpers (HH:MM to minutes).
- src/lib/rooms.ts: fictional four-room catalog with bookings.
- src/lib/roomFilters.ts: attendee parsing, capacity/equipment filtering, equipment options, selection fallback.
- src/lib/explain.ts: mock explanation adapter (deriveReasonCode, explainAvailability). Mock only — never calls a real AI/LLM API. booking.ts remains authoritative.
- src/lib/booking.test.ts: 26 Vitest tests for booking rules (AC1–AC5, non-finite times).
- src/lib/roomFilters.test.ts: 19 tests for capacity/equipment filtering, input validation, immutability.
- src/lib/roomSelection.test.ts: 13 tests for attendee parsing, equipment options, selection fallback.
- src/lib/rooms.test.ts: 7 tests for the room catalog.
- src/lib/explain.test.ts: 19 tests for the mock adapter (explanation text, input validation, fallback, hostile-label handling).
- src/lib/explain.contract.test.ts: 7 contract tests verifying deriveReasonCode maps each actual checkAvailability result to the correct reason code.
- src/components/RoomSelector.tsx: attendee input, equipment toggle buttons, matching room list.
- src/App.tsx: application UI, state management, time inputs, result panel.
- src/App.test.tsx: 10 rendered UI tests (jsdom) covering room listing, filtering, overlap, blocked rooms, and the explain-availability feature.

Total: 101 tests across 7 test files.

# Constraints

- Preserve AC1–AC6.
- AC1: Reject start >= end and past requests.
- AC2: Reject durations over 120 minutes.
- AC3: Reject blocked rooms.
- AC4: Reject overlaps and allow touching endpoints.
- AC5: Do not mutate booking data.
- AC6: Preserve clear responsive desktop/mobile feedback.
- No backend, login, database, or booking creation.
- The "Explain availability" feature is a mock adapter only. It must never call a real AI/LLM API. The deterministic result from booking.ts is always authoritative and must not be overridden.

# Engineering Rules

- Prefer pure functions and minimal changes.
- Use at most two justified design patterns; use none if unnecessary.
- Do not mutate original booking fixtures.
- Do not change the existing booking policy.
- Preserve existing UI behavior and styling.
- Avoid unnecessary refactoring or new dependencies.
- Do not remove or weaken existing tests.

# Verification

- Setup: run `npm install` first (never install new dependencies without approval).
- Run npm test for Vitest regression tests.
- Run npm run build.
- Use lint and typecheck commands if available (`npm run lint`, `npm run typecheck`).
- Check desktop and mobile UI behavior.
- Report changed files, rationale, actual test output, and remaining limitations.

# AI Agent Rules

- Allowed scope: application source under src/, its tests, and docs (AGENTS.md, README.md). Do not touch anything else.
- Forbidden: committing secrets or API keys, real personal data, production deployment or publishing, destructive commands (rm -rf, force overwrites), and any database, backend, or real LLM API work — all explicitly out of scope.
- Dependency changes and file deletions require explicit human approval first.
- If any test, build, lint, or typecheck run fails, stop and report the actual output; do not weaken tests or mask failures.
- If a task exceeds the requested scope, stop and report instead of expanding it.
- Every completed task must state: changed-file list, what changed and why, actual command results, and remaining limitations.

# Human Approval Gate (Merge / Deploy)

- Before any AI-generated work is accepted, merged, or deployed, a human must review and approve: the changed-file list, the diff, and the verification evidence (test, build, lint, typecheck results).
- An AI agent must never merge, push, publish, or deploy without explicit human authorization. When a task reaches a merge, push, publish, or deploy boundary, the agent must stop and report, then wait for human approval before proceeding.
- This gate supplements the existing prohibitions on production actions, secrets, destructive commands, and unauthorized dependency changes. It does not replace or weaken them.

# Current Refactoring Goals

- Centralize the maximum booking duration constant.
- Validate non-finite time values safely.
- Remove stale or unused code only after verifying it is unnecessary.

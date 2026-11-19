# Project memory

## Product intent & audience

- Smart Campus Room Availability Checker: students find available campus rooms to book.
- Fictional rooms with capacity/equipment filters and room selection.
- Optional "Explain availability" feature adds student-friendly explanations via a clearly labeled mock LLM adapter; deterministic availability remains authoritative.

## Brand personality & voice

- Explanations are short (≤2 sentences), respectful, student-friendly.
- Mock explanation is visibly distinguished from confirmed booking status ("Mock explanation (not an AI API response)").

## Visual design & UX direction

- Vite + React app; existing UI design and responsive layout preserved.
- Result panel includes an optional "Explain availability" button.
- Stale-response prevention: explanation clears on changes to room, requested times, current time, attendees, or equipment; request-counter guard blocks late responses.

## Decisions, constraints & rationale

- Framework: vite-react; no external network, no real API keys, no backend, no database, no new dependencies (Supabase already removed).
- `checkAvailability()` in `src/lib/booking.ts` is the ONLY source of truth for Available/Unavailable; it is untouched.
- Adapter lives in `src/lib/explain.ts` with structured input contract: `roomLabel`, `startTime` (HH:MM), `endTime` (HH:MM), `isAvailable`, `reasonCode`; returns `{ explanation: string }`.
- Inputs treated as untrusted data: validate empty/whitespace labels, malformed HH:MM, labels >200 chars, control characters; labels never interpreted as instructions.
- Safe deterministic fallback for invalid input, simulated timeout, and adapter/API failure.
- `deriveReasonCode()` maps from exact reason strings produced by `booking.ts` plus duration message from shared `MAX_DURATION_MIN`; unrecognized reasons degrade safely to "unknown" rather than fabricating facts.
- Constraint: if `booking.ts` messages are reworded, reason-code mapping degrades safely to unknown.

## Open questions & assumptions

- Contract limitation reported: reason-code mapping keys off `booking.ts` exact message text; rewording would require updating the mapping.
- Verification baseline: 90 tests pass across 6 test files; build, lint, typecheck pass.
# Project

Smart Campus room availability checker with one room, fictional bookings, and a fixed current time.

# Project Structure

- src/lib/booking.ts: pure availability validation logic.
- src/lib/time.ts: time conversion helpers.
- src/lib/booking.test.ts: existing Vitest regression tests.
- src/App.tsx: application UI and fictional booking fixtures.

# Constraints

- Preserve AC1–AC6.
- AC1: Reject start >= end and past requests.
- AC2: Reject durations over 120 minutes.
- AC3: Reject blocked rooms.
- AC4: Reject overlaps and allow touching endpoints.
- AC5: Do not mutate booking data.
- AC6: Preserve clear responsive desktop/mobile feedback.
- No backend, login, database, or booking creation.

# Engineering Rules

- Prefer pure functions and minimal changes.
- Use at most two justified design patterns; use none if unnecessary.
- Do not mutate original booking fixtures.
- Do not change the existing booking policy.
- Preserve existing UI behavior and styling.
- Avoid unnecessary refactoring or new dependencies.
- Do not remove or weaken existing tests.

# Verification

- Run npm test for Vitest regression tests.
- Run npm run build.
- Use lint and typecheck commands if available.
- Check desktop and mobile UI behavior.
- Report changed files, rationale, actual test output, and remaining limitations.

# Current Refactoring Goals

- Centralize the maximum booking duration constant.
- Validate non-finite time values safely.
- Remove stale or unused code only after verifying it is unnecessary.

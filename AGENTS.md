# Project

Smart Campus room availability checker with four fictional rooms, attendee/equipment filtering, and a fixed current time.

# Project Structure

- src/lib/booking.ts: pure availability validation logic (MAX_DURATION_MIN constant, NaN/Infinity guards).
- src/lib/time.ts: time conversion helpers (HH:MM to minutes).
- src/lib/rooms.ts: fictional four-room catalog with bookings.
- src/lib/roomFilters.ts: attendee parsing, capacity/equipment filtering, equipment options, selection fallback.
- src/lib/booking.test.ts: 26 Vitest tests for booking rules (AC1–AC5, non-finite times).
- src/lib/roomFilters.test.ts: 19 tests for capacity/equipment filtering, input validation, immutability.
- src/lib/roomSelection.test.ts: 13 tests for attendee parsing, equipment options, selection fallback.
- src/lib/rooms.test.ts: 7 tests for the room catalog.
- src/components/RoomSelector.tsx: attendee input, equipment toggle buttons, matching room list.
- src/App.tsx: application UI, state management, time inputs, result panel.
- src/App.test.tsx: 6 rendered UI tests (jsdom) covering room listing, filtering, overlap, and blocked rooms.

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

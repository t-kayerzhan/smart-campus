# Smart Campus Room Availability Checker

A small React web app that helps a student check whether a campus room is free for a requested time. Users filter rooms by attendee count and required equipment, select a room, enter a requested time window, and see whether that window is available. All room data is fictional and stored in the source code.

Published app: https://t-kayerzhan-smart-ca-5dk7.bolt.host

## Tech Stack

- **React 18** with **TypeScript** for the user interface
- **Vite** for the development server and production build
- **Tailwind CSS** for styling
- **lucide-react** for icons
- **Vitest** for unit and component tests
- **jsdom** as the browser-like test environment
- **@testing-library/react** and **@testing-library/dom** for rendering and querying the App component in tests
- **ESLint** and **typescript-eslint** for linting

## Implemented Features

### Explain availability (mock adapter, `src/lib/explain.ts`)

- An optional "Explain availability" button in the result panel produces a short, student-friendly explanation of the availability result.
- This is a **mock adapter** — it does not call any real AI or LLM API. It is visibly labeled as a mock explanation in the UI.
- The deterministic availability checker in `src/lib/booking.ts` remains the **only source of truth** for Available/Unavailable. The explanation never overrides or alters the booking result.
- The adapter validates all inputs as untrusted data (empty labels, malformed times, overly long labels, control characters) and falls back to a safe deterministic message on invalid input, simulated timeout, or adapter failure.
- `deriveReasonCode()` maps the booking checker's reason strings to structured reason codes. A contract test (`src/lib/explain.contract.test.ts`) verifies this mapping stays in sync with the actual booking logic.

### Booking rules (`src/lib/booking.ts`)

- **AC1:** A request is rejected if its start is not before its end, if it is outside the 0 to 1440 minute range, or if its start is not strictly after the supplied current time.
- **AC2:** A request longer than 120 minutes is rejected.
- **AC3:** A blocked room is always reported as unavailable.
- **AC4:** A request that overlaps an existing booking is rejected. Requests that only touch an existing booking's start or end are allowed.
- **AC5:** Booking data is read only and is never changed by a check.
- **AC6:** The interface shows a clear result message and uses responsive layout classes for desktop and mobile screens. This is checked by hand, not by automated tests (see Limitations).
- Non-finite times (`NaN`, `Infinity`) are rejected with a message instead of producing a result.

### Room filtering (`src/lib/roomFilters.ts`)

- **F1 (capacity):** Only rooms whose capacity is at least the number of attendees are shown.
- **F2 (equipment):** Only rooms that have every selected equipment item are shown. With no equipment selected, no equipment filter is applied.
- Attendee input must be a whole number of 1 or more. Invalid input shows an error message and no rooms are listed.
- When no room matches, the app shows an empty-state message.
- If the selected room is filtered out, the first matching room is selected.

### Interface (`src/App.tsx`, `src/components/RoomSelector.tsx`)

- Attendee count input and equipment toggle buttons
- A list of matching rooms, with blocked rooms marked
- Start time, end time, and supplied current time inputs
- A duration display that flags durations over 120 minutes
- A list of existing bookings for the selected room
- A result panel that shows "Available" or "Unavailable" with the reason

## Sample Rooms

All rooms, equipment, and bookings are fictional and defined in `src/lib/rooms.ts`.

| Room | Capacity | Equipment | Blocked | Existing booking |
| --- | --- | --- | --- | --- |
| Study Room A | 4 | Whiteboard, Monitor | No | 10:00–11:00 |
| Collaboration Room B | 8 | Whiteboard, Projector, Video Conferencing | No | 11:00–12:00 |
| Seminar Room C | 16 | Projector, Microphone, Speakers | No | 13:00–14:00 |
| Computer Lab D | 24 | Computers, Monitor, Whiteboard | Yes | 09:00–10:00 |

The app uses a fixed current time that the user can change in the interface. It does not read the real clock.

## Getting Started

Requirements: Node.js and npm.

Install the project dependencies from the project root:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite prints a local address in the terminal. Open it in a browser.

## Commands

All commands are defined in `package.json` and are run from the project root.

| Purpose | Command |
| --- | --- |
| Start the development server | `npm run dev` |
| Run the complete test suite | `npm test` |
| Run only the rendered UI tests | `npx vitest run src/App.test.tsx` |
| Build for production | `npm run build` |
| Lint the source | `npm run lint` |
| Type-check the app | `npm run typecheck` |
| Preview the production build | `npm run preview` |

## Tests

The test suite has 101 tests across 7 test files, organized in three layers.

**Logic tests** check the pure functions directly:

- `src/lib/booking.test.ts`: 26 tests for the booking rules (AC1–AC5, non-finite times)
- `src/lib/roomFilters.test.ts`: 19 tests for capacity and equipment filtering (F1 and F2), input validation, and immutability
- `src/lib/roomSelection.test.ts`: 13 tests for attendee parsing, equipment options, and selection fallback
- `src/lib/rooms.test.ts`: 7 tests for the room catalog

**Mock adapter tests** check the explanation feature:

- `src/lib/explain.test.ts`: 19 tests for the mock adapter (explanation text, input validation, fallback on timeout/failure, hostile-label handling)
- `src/lib/explain.contract.test.ts`: 7 contract tests verifying that `deriveReasonCode()` maps each actual `checkAvailability()` result to the correct specific reason code (available, blocked, invalid_current_time, invalid_interval, past_request, duration_exceeded, overlap)

**Rendered UI tests** (`src/App.test.tsx`) render the full `App` component in jsdom and use real user-style interactions (typing, clicking buttons, changing time inputs):

1. The default list shows the four fictional rooms.
2. Changing the attendee count and selecting an equipment item filters the visible rooms.
3. A filter with no matching rooms shows the empty-state message.
4. Selecting Study Room A for 10:30–11:00 with current time 09:00 shows "Unavailable" because of the overlap with the 10:00–11:00 booking.
5. Switching to Collaboration Room B with the same times changes the result to "Available".
6. Selecting Computer Lab D shows "Unavailable" because the room is blocked.

The most recent full run reported **101 passing tests** across 7 test files (85 logic/adapter tests and 10 UI tests). Run `npm test` to check the current result.

## Project Structure

```
src/
  App.tsx                    Main page: state, filters, time inputs, result panel
  App.test.tsx               Rendered UI tests for App (10 tests)
  main.tsx                   React entry point
  index.css                  Tailwind directives
  components/
    RoomSelector.tsx         Attendee input, equipment buttons, matching room list
  lib/
    booking.ts               Availability rules (pure function, MAX_DURATION_MIN)
    booking.test.ts          Booking rule tests (26 tests)
    time.ts                  Time conversion helpers (HH:MM to minutes)
    rooms.ts                 Fictional room catalog and bookings
    rooms.test.ts            Catalog tests (7 tests)
    roomFilters.ts           Attendee parsing, filtering, equipment list, selection fallback
    roomFilters.test.ts      Filter tests (19 tests)
    roomSelection.test.ts    Parsing and selection tests (13 tests)
    explain.ts               Mock explanation adapter (deriveReasonCode, explainAvailability)
    explain.test.ts          Mock adapter tests (19 tests)
    explain.contract.test.ts Reason-code contract tests (7 tests)
AGENTS.md                    Project constraints and engineering rules
```

## Limitations

- **Fictional local data:** Rooms and bookings are hard-coded in `src/lib/rooms.ts`. The app cannot add, edit, or create bookings.
- **No persistent database:** Nothing is saved between page loads. There is no login and no backend in use.
- **Fixed current time:** The "current time" is an input the user sets. The app does not use the real clock.
- **Mock explanation only:** The "Explain availability" feature uses a mock adapter, not a real AI/LLM API. The deterministic result from `booking.ts` is always authoritative.
- **Test limits:** The UI tests run in jsdom, a simulated browser environment. They do not check the real layout, styling, or behavior in a real browser. Desktop and mobile appearance must be checked by hand in a real browser.

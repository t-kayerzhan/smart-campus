import { MAX_DURATION_MIN } from './booking';
import type { Result } from './booking';

export type ReasonCode =
  | 'available'
  | 'blocked'
  | 'invalid_interval'
  | 'invalid_current_time'
  | 'past_request'
  | 'duration_exceeded'
  | 'overlap'
  | 'unknown';

export interface ExplainInput {
  roomLabel: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reasonCode: ReasonCode;
}

export interface ExplainResult {
  explanation: string;
}

export interface ExplainOptions {
  mode?: 'mock' | 'timeout' | 'failure';
  timeoutMs?: number;
}

const MAX_ROOM_LABEL_LENGTH = 200;
const HHMM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const CONTROL_CHARS = new RegExp('[\\u0000-\\u001F\\u007F]', 'g'); // eslint-disable-line no-control-regex -- deliberate sanitization of untrusted text

export const FALLBACK_EXPLANATION =
  'Sorry, an explanation is not available right now. The availability result shown above is still accurate.';

const UNAVAILABLE_CODES: readonly ReasonCode[] = [
  'blocked',
  'invalid_interval',
  'invalid_current_time',
  'past_request',
  'duration_exceeded',
  'overlap',
  'unknown',
];

// Contract limitation: maps on the exact reason strings owned by booking.ts.
// If booking.ts changes a message, the mapping falls back to 'unknown' rather
// than inventing a reason.
const REASON_BY_TEXT: Record<string, ReasonCode> = {
  'Room is currently blocked.': 'blocked',
  'Interval must satisfy 0 ≤ start < end ≤ 1440 minutes.': 'invalid_interval',
  'Current time must be a valid time.': 'invalid_current_time',
  'Start time must be strictly after the supplied current time.': 'past_request',
};

export function deriveReasonCode(result: Result): ReasonCode {
  if (result.status === 'available') return 'available';
  if (result.reason === `Duration cannot exceed ${MAX_DURATION_MIN} minutes.`) {
    return 'duration_exceeded';
  }
  if (result.reason.startsWith('Overlaps existing booking')) return 'overlap';
  return REASON_BY_TEXT[result.reason] ?? 'unknown';
}

function sanitizeRoomLabel(raw: string): string | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.replace(CONTROL_CHARS, '').trim();
  if (cleaned.length === 0 || cleaned.length > MAX_ROOM_LABEL_LENGTH) return null;
  return cleaned;
}

function isValidPair(isAvailable: boolean, reasonCode: ReasonCode): boolean {
  return isAvailable
    ? reasonCode === 'available'
    : UNAVAILABLE_CODES.includes(reasonCode);
}

function buildExplanation(label: string, input: ExplainInput): string {
  const { startTime, endTime, reasonCode } = input;
  switch (reasonCode) {
    case 'available':
      return `${label} is free from ${startTime} to ${endTime}. You can plan your session in that time.`;
    case 'blocked':
      return `${label} is currently blocked, so it cannot be used for this time. Please choose a different room.`;
    case 'overlap':
      return `Your requested time overlaps an existing booking in ${label}. Please pick a time that does not clash with the listed bookings.`;
    case 'duration_exceeded':
      return `Your request is longer than the ${MAX_DURATION_MIN}-minute limit. Please shorten it to ${MAX_DURATION_MIN} minutes or less.`;
    case 'past_request':
      return `The start of your request must be after the supplied current time. Please choose a later start time.`;
    case 'invalid_interval':
      return `The requested interval is not valid, so the room cannot be checked. Please make sure the start is before the end within the same day.`;
    case 'invalid_current_time':
      return `The supplied current time is not valid, so availability cannot be confirmed. Please check the current time input.`;
    case 'unknown':
      return `The reason for this result could not be determined. Please refer to the availability message shown above.`;
  }
}

export async function explainAvailability(
  input: ExplainInput,
  options: ExplainOptions = {},
): Promise<ExplainResult> {
  const { mode = 'mock', timeoutMs = 2000 } = options;

  const label = sanitizeRoomLabel(input.roomLabel);
  const valid =
    label !== null &&
    typeof input.startTime === 'string' &&
    typeof input.endTime === 'string' &&
    HHMM_PATTERN.test(input.startTime) &&
    HHMM_PATTERN.test(input.endTime) &&
    typeof input.isAvailable === 'boolean' &&
    UNAVAILABLE_CODES.concat('available').includes(input.reasonCode) &&
    isValidPair(input.isAvailable, input.reasonCode);

  if (!valid) return { explanation: FALLBACK_EXPLANATION };
  if (mode === 'failure') return { explanation: FALLBACK_EXPLANATION };
  if (mode === 'timeout') {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ explanation: FALLBACK_EXPLANATION }), timeoutMs);
    });
  }
  return { explanation: buildExplanation(label, input) };
}

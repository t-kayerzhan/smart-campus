import { describe, it, expect } from 'vitest';
import { checkAvailability } from './booking';
import { deriveReasonCode } from './explain';
import type { ExistingBooking } from './booking';

describe('reason-code contract: checkAvailability → deriveReasonCode', () => {
  it('maps an available result to "available"', () => {
    const result = checkAvailability(660, 720, 540, false, []);
    expect(result.status).toBe('available');
    expect(deriveReasonCode(result)).toBe('available');
  });

  it('maps a blocked room to "blocked"', () => {
    const result = checkAvailability(660, 720, 540, true, []);
    expect(result.status).toBe('unavailable');
    expect(deriveReasonCode(result)).toBe('blocked');
  });

  it('maps an invalid current time to "invalid_current_time"', () => {
    const result = checkAvailability(660, 720, NaN, false, []);
    expect(result.status).toBe('unavailable');
    expect(deriveReasonCode(result)).toBe('invalid_current_time');
  });

  it('maps an invalid interval (start >= end) to "invalid_interval"', () => {
    const result = checkAvailability(720, 720, 540, false, []);
    expect(result.status).toBe('unavailable');
    expect(deriveReasonCode(result)).toBe('invalid_interval');
  });

  it('maps a past request (start <= currentTime) to "past_request"', () => {
    const result = checkAvailability(540, 570, 540, false, []);
    expect(result.status).toBe('unavailable');
    expect(deriveReasonCode(result)).toBe('past_request');
  });

  it('maps a duration over the limit to "duration_exceeded"', () => {
    const result = checkAvailability(720, 841, 540, false, []);
    expect(result.status).toBe('unavailable');
    expect(deriveReasonCode(result)).toBe('duration_exceeded');
  });

  it('maps a booking overlap to "overlap"', () => {
    const bookings: ExistingBooking[] = [
      { start: 600, end: 660, label: '10:00–11:00' },
    ];
    const result = checkAvailability(630, 690, 540, false, bookings);
    expect(result.status).toBe('unavailable');
    expect(deriveReasonCode(result)).toBe('overlap');
  });
});

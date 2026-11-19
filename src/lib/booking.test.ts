import { describe, it, expect } from 'vitest';
import { checkAvailability } from './booking';
import type { ExistingBooking } from './booking';
import { hhmmToMinutes } from './time';

function makeFixture() {
  return {
    currentTime: 540,
    roomBlocked: false,
    bookings: [{ start: 600, end: 660, label: '10:00–11:00' }] as ExistingBooking[],
  };
}

describe('checkAvailability', () => {
  it('T01 AC4: touching after existing booking is available', () => {
    const f = makeFixture();
    const result = checkAvailability(660, 720, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('available');
  });

  it('T02 AC1: start equal to current time is unavailable', () => {
    const f = makeFixture();
    const result = checkAvailability(540, 570, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T03 AC1: zero duration is unavailable', () => {
    const f = makeFixture();
    const result = checkAvailability(720, 720, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T04 AC1: reversed interval (end before start) is unavailable', () => {
    const f = makeFixture();
    const result = checkAvailability(750, 720, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T05 AC1: end past 1440 is unavailable', () => {
    const f = makeFixture();
    const result = checkAvailability(1380, 1441, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T06 AC2: exactly 120 minutes is available', () => {
    const f = makeFixture();
    const result = checkAvailability(720, 840, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('available');
  });

  it('T07 AC2: 121 minutes is unavailable', () => {
    const f = makeFixture();
    const result = checkAvailability(720, 841, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T08 AC4: touching before existing booking is available', () => {
    const f = makeFixture();
    const result = checkAvailability(570, 600, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('available');
  });

  it('T09 AC4: partial overlap with existing booking is unavailable', () => {
    const f = makeFixture();
    const result = checkAvailability(630, 690, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T10 AC4: interval containing existing booking is unavailable', () => {
    const f = makeFixture();
    const result = checkAvailability(570, 690, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T11 AC4: interval inside existing booking is unavailable', () => {
    const f = makeFixture();
    const result = checkAvailability(615, 645, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T12 AC4: identical to existing booking is unavailable', () => {
    const f = makeFixture();
    const result = checkAvailability(600, 660, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T13 AC3: room blocked is unavailable', () => {
    const f = makeFixture();
    const result = checkAvailability(660, 720, f.currentTime, true, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T14 AC4: no existing bookings is available', () => {
    const f = makeFixture();
    const result = checkAvailability(630, 690, f.currentTime, f.roomBlocked, []);
    expect(result.status).toBe('available');
  });

  it('T15a AC5: bookings array unchanged after available call', () => {
    const f = makeFixture();
    const before = JSON.stringify(f.bookings);
    const result = checkAvailability(660, 720, f.currentTime, f.roomBlocked, f.bookings);
    const after = JSON.stringify(f.bookings);
    expect(after).toBe(before);
    expect(result.status).toBe('available');
  });

  it('T15b AC5: bookings array unchanged after unavailable call', () => {
    const f = makeFixture();
    const before = JSON.stringify(f.bookings);
    const result = checkAvailability(630, 690, f.currentTime, f.roomBlocked, f.bookings);
    const after = JSON.stringify(f.bookings);
    expect(after).toBe(before);
    expect(result.status).toBe('unavailable');
  });

  it('T16 AC4: available with several existing bookings', () => {
    const f = makeFixture();
    const bookings: ExistingBooking[] = [
      { start: 600, end: 660, label: '10:00–11:00' },
      { start: 900, end: 960, label: '15:00–16:00' },
    ];
    const result = checkAvailability(720, 840, f.currentTime, f.roomBlocked, bookings);
    expect(result.status).toBe('available');
  });

  it('T17 AC1: end exactly at 1440 is available', () => {
    const f = makeFixture();
    const result = checkAvailability(1380, 1440, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('available');
  });

  it('T18 AC4: overlap with the second of several bookings is unavailable', () => {
    const bookings: ExistingBooking[] = [
      { start: 600, end: 660, label: '10:00–11:00' },
      { start: 900, end: 960, label: '15:00–16:00' },
    ];
    const result = checkAvailability(930, 990, 540, false, bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T19 AC1: start one minute after current time is available', () => {
    const f = makeFixture();
    const result = checkAvailability(541, 600, f.currentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('available');
  });

  it('T20 AC1: blank current time cannot accept a past request', () => {
    const f = makeFixture();
    const blankCurrentTime = hhmmToMinutes('');
    const result = checkAvailability(480, 510, blankCurrentTime, f.roomBlocked, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T21 AC1: NaN start or end is unavailable', () => {
    const f = makeFixture();
    expect(checkAvailability(NaN, 720, f.currentTime, f.roomBlocked, f.bookings).status).toBe('unavailable');
    expect(checkAvailability(660, NaN, f.currentTime, f.roomBlocked, f.bookings).status).toBe('unavailable');
  });

  it('T22 AC1: infinite start or end is unavailable', () => {
    const f = makeFixture();
    expect(checkAvailability(-Infinity, 720, f.currentTime, f.roomBlocked, f.bookings).status).toBe('unavailable');
    expect(checkAvailability(660, Infinity, f.currentTime, f.roomBlocked, f.bookings).status).toBe('unavailable');
  });

  it('T23 AC1: infinite current time is unavailable', () => {
    const f = makeFixture();
    const result = checkAvailability(660, 720, Infinity, f.roomBlocked, f.bookings);
    expect(result.status).toBe('unavailable');
  });

  it('T24 AC3: blocked room is reported before a blank current time', () => {
    const f = makeFixture();
    const result = checkAvailability(660, 720, NaN, true, f.bookings);
    expect(result).toEqual({ status: 'unavailable', reason: 'Room is currently blocked.' });
  });

  it('T25 AC2: over-limit duration reports the exact limit message', () => {
    const f = makeFixture();
    const result = checkAvailability(720, 841, f.currentTime, f.roomBlocked, f.bookings);
    expect(result).toEqual({ status: 'unavailable', reason: 'Duration cannot exceed 120 minutes.' });
  });
});

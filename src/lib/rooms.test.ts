import { describe, it, expect } from 'vitest';
import { ROOMS } from '@/lib/rooms';

describe('ROOMS catalog', () => {
  it('contains exactly four rooms', () => {
    expect(ROOMS).toHaveLength(4);
  });

  it('has unique room IDs', () => {
    const ids = ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every room the required fields', () => {
    for (const room of ROOMS) {
      expect(typeof room.id).toBe('string');
      expect(typeof room.name).toBe('string');
      expect(typeof room.capacity).toBe('number');
      expect(Array.isArray(room.equipment)).toBe(true);
      expect(typeof room.blocked).toBe('boolean');
      expect(Array.isArray(room.bookings)).toBe(true);
    }
  });

  it('uses positive finite capacities', () => {
    for (const room of ROOMS) {
      expect(Number.isFinite(room.capacity)).toBe(true);
      expect(room.capacity).toBeGreaterThan(0);
    }
  });

  it('gives each room its own bookings array', () => {
    const arrays = ROOMS.map((r) => r.bookings);
    expect(new Set(arrays).size).toBe(arrays.length);
  });

  it('includes at least one blocked room', () => {
    expect(ROOMS.some((r) => r.blocked)).toBe(true);
  });

  it('has booking start times before end times', () => {
    for (const room of ROOMS) {
      for (const b of room.bookings) {
        expect(b.start).toBeLessThan(b.end);
      }
    }
  });
});

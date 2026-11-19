import { describe, it, expect } from 'vitest';
import { filterRooms } from '@/lib/roomFilters';
import { ROOMS, type Room } from '@/lib/rooms';

const SAMPLE: Room[] = [
  { id: 'small', name: 'Small', capacity: 4, equipment: ['Whiteboard'], blocked: false, bookings: [] },
  { id: 'mid', name: 'Mid', capacity: 8, equipment: ['Whiteboard', 'Projector'], blocked: false, bookings: [] },
  { id: 'big', name: 'Big', capacity: 16, equipment: ['Projector', 'Speakers'], blocked: true, bookings: [] },
];

const ids = (rooms: Room[]) => rooms.map((r) => r.id);

describe('filterRooms capacity (F1)', () => {
  it('matches a room whose capacity equals the attendee count', () => {
    expect(ids(filterRooms(SAMPLE, 8, []))).toEqual(['mid', 'big']);
  });

  it('rejects a room whose capacity is below the attendee count', () => {
    expect(ids(filterRooms(SAMPLE, 5, []))).not.toContain('small');
  });

  it('matches a room whose capacity is above the attendee count', () => {
    expect(ids(filterRooms(SAMPLE, 2, []))).toEqual(['small', 'mid', 'big']);
  });
});

describe('filterRooms equipment (F2)', () => {
  it('matches a room that has one required item', () => {
    expect(ids(filterRooms(SAMPLE, 1, ['Speakers']))).toEqual(['big']);
  });

  it('matches a room that has every required item', () => {
    expect(ids(filterRooms(SAMPLE, 1, ['Whiteboard', 'Projector']))).toEqual(['mid']);
  });

  it('rejects a room missing at least one required item', () => {
    expect(filterRooms(SAMPLE, 1, ['Whiteboard', 'Speakers'])).toEqual([]);
  });

  it('applies no equipment restriction when no items are required', () => {
    expect(ids(filterRooms(SAMPLE, 1, []))).toEqual(['small', 'mid', 'big']);
  });
});

describe('filterRooms combined', () => {
  it('requires both capacity and equipment to match', () => {
    expect(ids(filterRooms(SAMPLE, 6, ['Projector']))).toEqual(['mid', 'big']);
    expect(ids(filterRooms(SAMPLE, 6, ['Whiteboard']))).toEqual(['mid']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterRooms(SAMPLE, 100, [])).toEqual([]);
  });

  it('keeps blocked rooms that meet the requirements', () => {
    expect(ids(filterRooms(SAMPLE, 16, ['Speakers']))).toEqual(['big']);
    expect(SAMPLE.find((r) => r.id === 'big')?.blocked).toBe(true);
  });

  it('works against the real room catalog', () => {
    expect(ids(filterRooms(ROOMS, 10, []))).toEqual(['room-c', 'room-d']);
  });
});

describe('filterRooms invalid input', () => {
  it.each([NaN, Infinity, -Infinity, -3, 0, 2.5])('rejects attendees value %s', (value) => {
    expect(() => filterRooms(SAMPLE, value, [])).toThrow(RangeError);
  });
});

describe('filterRooms immutability', () => {
  it('does not mutate rooms, equipment, or bookings', () => {
    const rooms = structuredClone(SAMPLE);
    const snapshot = structuredClone(SAMPLE);
    filterRooms(rooms, 4, ['Whiteboard']);
    expect(rooms).toEqual(snapshot);
  });

  it('does not mutate the requirements array', () => {
    const required = ['Whiteboard'];
    filterRooms(SAMPLE, 1, required);
    expect(required).toEqual(['Whiteboard']);
  });
});

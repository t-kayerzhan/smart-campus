import { describe, it, expect } from 'vitest';
import {
  getEquipmentOptions,
  parseAttendees,
  resolveSelectedRoomId,
} from '@/lib/roomFilters';
import { ROOMS, type Room } from '@/lib/rooms';

describe('parseAttendees', () => {
  it('accepts positive whole numbers, ignoring surrounding spaces', () => {
    expect(parseAttendees('2')).toBe(2);
    expect(parseAttendees(' 12 ')).toBe(12);
  });

  it.each(['', '   ', '0', '-1', '2.5', 'NaN', 'Infinity', 'abc'])(
    'returns null for invalid input %j',
    (input) => {
      expect(parseAttendees(input)).toBeNull();
    },
  );
});

describe('getEquipmentOptions', () => {
  it('returns unique equipment from the catalog, sorted', () => {
    const options = getEquipmentOptions(ROOMS);
    expect(new Set(options).size).toBe(options.length);
    expect(options).toEqual([...options].sort((a, b) => a.localeCompare(b)));
    expect(options).toContain('Whiteboard');
    expect(options).toContain('Video Conferencing');
  });
});

describe('resolveSelectedRoomId', () => {
  const matches: Room[] = ROOMS.slice(2);

  it('keeps the current selection when it still matches', () => {
    expect(resolveSelectedRoomId(matches, 'room-d')).toBe('room-d');
  });

  it('falls back to the first match when the selection is filtered out', () => {
    expect(resolveSelectedRoomId(matches, 'room-a')).toBe('room-c');
  });

  it('returns null when nothing matches', () => {
    expect(resolveSelectedRoomId([], 'room-a')).toBeNull();
  });
});

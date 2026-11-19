import type { Room } from '@/lib/rooms';

export function filterRooms(
  rooms: readonly Room[],
  requestedAttendees: number,
  requiredEquipment: readonly string[],
): Room[] {
  if (!Number.isInteger(requestedAttendees) || requestedAttendees < 1) {
    throw new RangeError(
      `requestedAttendees must be a positive integer, received ${requestedAttendees}`,
    );
  }

  return rooms.filter(
    (room) =>
      room.capacity >= requestedAttendees &&
      requiredEquipment.every((item) => room.equipment.includes(item)),
  );
}

export function parseAttendees(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isInteger(value) && value >= 1 ? value : null;
}

export function getEquipmentOptions(rooms: readonly Room[]): string[] {
  return [...new Set(rooms.flatMap((room) => room.equipment))].sort((a, b) => a.localeCompare(b));
}

export function resolveSelectedRoomId(matches: readonly Room[], currentId: string | null): string | null {
  if (matches.some((room) => room.id === currentId)) return currentId;
  return matches[0]?.id ?? null;
}

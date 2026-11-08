import { Ban, Check, Users } from 'lucide-react';
import type { Room } from '@/lib/rooms';

interface RoomSelectorProps {
  attendeesInput: string;
  attendeesValid: boolean;
  onAttendeesChange: (value: string) => void;
  equipmentOptions: string[];
  requiredEquipment: string[];
  onToggleEquipment: (item: string) => void;
  matches: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (id: string) => void;
}

export function RoomSelector({
  attendeesInput,
  attendeesValid,
  onAttendeesChange,
  equipmentOptions,
  requiredEquipment,
  onToggleEquipment,
  matches,
  selectedRoomId,
  onSelectRoom,
}: RoomSelectorProps) {
  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Attendees</span>
        <div className="relative mt-1">
          <Users className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={attendeesInput}
            onChange={(e) => onAttendeesChange(e.target.value)}
            aria-invalid={!attendeesValid}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none aria-[invalid=true]:border-red-500"
          />
        </div>
        {!attendeesValid && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            Enter a whole number of attendees, 1 or more.
          </p>
        )}
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Required equipment</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {equipmentOptions.map((item) => {
            const active = requiredEquipment.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleEquipment(item)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5" />}
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <p className="text-sm font-medium text-slate-700">Matching rooms</p>
        {attendeesValid && matches.length === 0 && (
          <div
            role="status"
            className="mt-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600"
          >
            No rooms match these requirements. Try fewer attendees or fewer equipment items.
          </div>
        )}
        {attendeesValid && matches.length > 0 && (
          <ul className="mt-2 space-y-2">
            {matches.map((room) => {
              const selected = room.id === selectedRoomId;
              return (
                <li key={room.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectRoom(room.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{room.name}</span>
                      {room.blocked && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            selected ? 'bg-white text-red-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          <Ban className="w-3 h-3" />
                          Blocked
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 text-xs ${selected ? 'text-slate-200' : 'text-slate-500'}`}>
                      Capacity {room.capacity} · {room.equipment.join(', ')}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

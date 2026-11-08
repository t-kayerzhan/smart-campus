import { useEffect, useMemo, useState } from 'react';
import { Clock, DoorClosed, CheckCircle2, XCircle } from 'lucide-react';
import { hhmmToMinutes } from '@/lib/time';
import { checkAvailability, MAX_DURATION_MIN } from '@/lib/booking';
import { ROOMS } from '@/lib/rooms';
import {
  filterRooms,
  getEquipmentOptions,
  parseAttendees,
  resolveSelectedRoomId,
} from '@/lib/roomFilters';
import { RoomSelector } from '@/components/RoomSelector';

const EQUIPMENT_OPTIONS = getEquipmentOptions(ROOMS);

function App() {
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('11:30');
  const [currentTimeStr, setCurrentTimeStr] = useState('09:00');
  const [attendeesInput, setAttendeesInput] = useState('2');
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const startMin = hhmmToMinutes(startTime);
  const endMin = hhmmToMinutes(endTime);
  const currentTime = hhmmToMinutes(currentTimeStr);
  const attendees = parseAttendees(attendeesInput);

  const matches = useMemo(
    () => (attendees === null ? [] : filterRooms(ROOMS, attendees, requiredEquipment)),
    [attendees, requiredEquipment]
  );

  useEffect(() => {
    setSelectedRoomId((current) => resolveSelectedRoomId(matches, current));
  }, [matches]);

  const selectedRoom = matches.find((room) => room.id === selectedRoomId) ?? null;

  const result = useMemo(
    () =>
      selectedRoom
        ? checkAvailability(startMin, endMin, currentTime, selectedRoom.blocked, selectedRoom.bookings)
        : null,
    [selectedRoom, startMin, endMin, currentTime]
  );

  const duration = endMin - startMin;

  const toggleEquipment = (item: string) =>
    setRequiredEquipment((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-xl">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-slate-700 mb-2">
            <DoorClosed className="w-6 h-6" />
            <span className="text-sm font-medium tracking-wide uppercase text-slate-500">
              Smart Campus
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Room Availability Checker
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            {selectedRoom ? selectedRoom.name : 'Choose a room to check availability'}
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8 space-y-6">
          <RoomSelector
            attendeesInput={attendeesInput}
            attendeesValid={attendees !== null}
            onAttendeesChange={setAttendeesInput}
            equipmentOptions={EQUIPMENT_OPTIONS}
            requiredEquipment={requiredEquipment}
            onToggleEquipment={toggleEquipment}
            matches={matches}
            selectedRoomId={selectedRoom?.id ?? null}
            onSelectRoom={setSelectedRoomId}
          />

          {/* Time inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Request start</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Request end</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Supplied current time
            </span>
            <input
              type="time"
              value={currentTimeStr}
              onChange={(e) => setCurrentTimeStr(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none"
            />
          </label>

          {/* Duration hint */}
          <p className="text-xs text-slate-500">
            Duration: {duration > 0 ? `${duration} min` : '—'}
            {duration > MAX_DURATION_MIN && (
              <span className="text-red-600 font-medium"> (exceeds {MAX_DURATION_MIN} min limit)</span>
            )}
          </p>

          {selectedRoom && (
            <>
              {/* Existing bookings reference */}
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Existing bookings
                </p>
                {selectedRoom.bookings.length > 0 ? (
                  <ul className="text-sm text-slate-700">
                    {selectedRoom.bookings.map((b) => (
                      <li key={b.label} className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {b.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-600">No bookings for this room.</p>
                )}
              </div>

              {/* Result */}
              {result && (
                <div
                  className={`rounded-xl p-4 flex items-start gap-3 ${
                    result.status === 'available'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {result.status === 'available' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`font-semibold ${
                        result.status === 'available' ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {result.status === 'available' ? 'Available' : 'Unavailable'}
                    </p>
                    {result.status === 'unavailable' && (
                      <p className="text-sm text-red-700 mt-0.5">{result.reason}</p>
                    )}
                    {result.status === 'available' && (
                      <p className="text-sm text-green-700 mt-0.5">
                        The room is free for your requested interval.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Fictional sample data — no real bookings are modified.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

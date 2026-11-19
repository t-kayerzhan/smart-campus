import type { ExistingBooking } from '@/lib/booking';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: ExistingBooking[];
}

export const ROOMS: Room[] = [
  {
    id: 'room-a',
    name: 'Study Room A',
    capacity: 4,
    equipment: ['Whiteboard', 'Monitor'],
    blocked: false,
    bookings: [{ start: 600, end: 660, label: '10:00–11:00' }],
  },
  {
    id: 'room-b',
    name: 'Collaboration Room B',
    capacity: 8,
    equipment: ['Whiteboard', 'Projector', 'Video Conferencing'],
    blocked: false,
    bookings: [{ start: 660, end: 720, label: '11:00–12:00' }],
  },
  {
    id: 'room-c',
    name: 'Seminar Room C',
    capacity: 16,
    equipment: ['Projector', 'Microphone', 'Speakers'],
    blocked: false,
    bookings: [{ start: 780, end: 840, label: '13:00–14:00' }],
  },
  {
    id: 'room-d',
    name: 'Computer Lab D',
    capacity: 24,
    equipment: ['Computers', 'Monitor', 'Whiteboard'],
    blocked: true,
    bookings: [{ start: 540, end: 600, label: '09:00–10:00' }],
  },
];

// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

afterEach(() => {
  cleanup();
});

const roomButton = (name: RegExp) => screen.queryByRole('button', { name });
const equipmentButton = (name: string) => screen.getByRole('button', { name });

function setRequestTimes(start: string, end: string) {
  fireEvent.change(screen.getByLabelText('Request start'), { target: { value: start } });
  fireEvent.change(screen.getByLabelText('Request end'), { target: { value: end } });
}

function setAttendees(value: string) {
  fireEvent.change(screen.getByLabelText('Attendees'), { target: { value } });
}

describe('App room availability UI', () => {
  it('lists the four fictional rooms by default', () => {
    render(<App />);
    expect(screen.getAllByRole('button', { name: /Capacity/ })).toHaveLength(4);
    expect(roomButton(/Study Room A/)).not.toBeNull();
    expect(roomButton(/Collaboration Room B/)).not.toBeNull();
    expect(roomButton(/Seminar Room C/)).not.toBeNull();
    expect(roomButton(/Computer Lab D/)).not.toBeNull();
  });

  it('filters the visible rooms by capacity and equipment', () => {
    render(<App />);

    setAttendees('10');
    expect(roomButton(/Study Room A/)).toBeNull();
    expect(roomButton(/Collaboration Room B/)).toBeNull();
    expect(roomButton(/Seminar Room C/)).not.toBeNull();
    expect(roomButton(/Computer Lab D/)).not.toBeNull();

    fireEvent.click(equipmentButton('Projector'));
    expect(equipmentButton('Projector').getAttribute('aria-pressed')).toBe('true');
    expect(roomButton(/Seminar Room C/)).not.toBeNull();
    expect(roomButton(/Computer Lab D/)).toBeNull();
  });

  it('shows a clear empty state when no room matches', () => {
    render(<App />);

    setAttendees('10');
    fireEvent.click(equipmentButton('Video Conferencing'));

    expect(
      screen.getByRole('status').textContent,
    ).toBe('No rooms match these requirements. Try fewer attendees or fewer equipment items.');
    expect(screen.queryByRole('button', { name: /Study Room|Collaboration Room|Seminar Room|Computer Lab/ })).toBeNull();
  });

  it('shows Unavailable for Study Room A when the request overlaps its booking', () => {
    render(<App />);

    fireEvent.click(roomButton(/Study Room A/)!);
    setRequestTimes('10:30', '11:00');

    expect(screen.getByText('Unavailable')).not.toBeNull();
    expect(screen.getByText('Overlaps existing booking 10:00–11:00.')).not.toBeNull();
  });

  it('switches to Available when Collaboration Room B is selected for the same times', () => {
    render(<App />);

    fireEvent.click(roomButton(/Study Room A/)!);
    setRequestTimes('10:30', '11:00');
    expect(screen.getByText('Unavailable')).not.toBeNull();

    fireEvent.click(roomButton(/Collaboration Room B/)!);

    expect(screen.getByText('Available')).not.toBeNull();
    expect(screen.queryByText('Unavailable')).toBeNull();
  });

  it('shows Unavailable for Computer Lab D because the room is blocked', () => {
    render(<App />);

    fireEvent.click(roomButton(/Computer Lab D/)!);
    setRequestTimes('10:30', '11:00');

    expect(screen.getByText('Unavailable')).not.toBeNull();
    expect(screen.getByText('Room is currently blocked.')).not.toBeNull();
  });
});

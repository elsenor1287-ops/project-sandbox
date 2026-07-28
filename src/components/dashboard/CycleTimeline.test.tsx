import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CycleTimeline } from './CycleTimeline';

describe('CycleTimeline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders correctly and calculates classes based on currentTime', () => {
    const mockNow = new Date('2023-10-15T12:00:00Z');
    vi.setSystemTime(mockNow);
    const dateNowSpy = vi.spyOn(Date, 'now');

    const events = [
      {
        id: '1',
        title: 'Past Event',
        date: new Date('2023-10-10T12:00:00Z'),
        type: 'voting' as const
      },
      {
        id: '2',
        title: 'Current Event',
        date: new Date('2023-10-15T18:00:00Z'), // 6 hours in the future
        type: 'proposal' as const
      },
      {
        id: '3',
        title: 'Future Event',
        date: new Date('2023-10-20T12:00:00Z'),
        type: 'result' as const
      }
    ];

    render(<CycleTimeline calendarEvents={events} />);

    // The optimization is that Date.now() should only be called once per render, not once per event
    expect(dateNowSpy).toHaveBeenCalledTimes(1);

    expect(screen.getByText('Past Event')).toBeInTheDocument();
    expect(screen.getByText('Current Event')).toBeInTheDocument();
    expect(screen.getByText('Future Event')).toBeInTheDocument();
  });
});

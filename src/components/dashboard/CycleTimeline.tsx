import { Calendar } from 'lucide-react';
import type { CalendarEvent } from '../../types';

interface CycleTimelineProps {
  calendarEvents: CalendarEvent[];
}

export function CycleTimeline({ calendarEvents }: CycleTimelineProps) {
  return (
    <div className="card p-6 col-span-1">
      <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Cycle Timeline
      </h2>
      <div className="relative pl-6 space-y-6">
        {/* Timeline line */}
        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-primary-700" />

        {calendarEvents.map((event) => {
          const isPast = event.date < new Date();
          const isCurrent = Math.abs(event.date.getTime() - Date.now()) < 86400000;

          return (
            <div key={event.id} className="relative">
              <div
                className={`absolute -left-4 w-3 h-3 rounded-full ${
                  isPast
                    ? 'bg-success-500'
                    : isCurrent
                    ? 'bg-accent-500 animate-pulse'
                    : 'bg-primary-600'
                }`}
              />
              <div
                className={`p-3 rounded-lg ${
                  isCurrent
                    ? 'bg-accent-500/10 border border-accent-500/30'
                    : 'bg-primary-800/30'
                }`}
              >
                <p className="font-medium text-primary-200">{event.title}</p>
                <p className="text-xs text-primary-400 mt-1">
                  {event.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

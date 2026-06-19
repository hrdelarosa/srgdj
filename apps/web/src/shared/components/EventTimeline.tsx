import { Clock, MoveRightIcon, User } from 'lucide-react'
import type { DocumentEvent } from '@/modules/documents/types/document.types'
import { formatDate } from '../lib/formatDate'
import { eventLabel } from '../lib/eventLabel'

export default function EventTimeline({ events }: { events: DocumentEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground">
        Sin eventos registrados.
      </p>
    )
  }

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span className="absolute -left-8 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-primary" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {eventLabel(event.eventType)}
            </span>
            {event.toStatus && (
              <span className="text-xs text-muted-foreground inline-flex items-center gap-2">
                {event.fromStatus ? (
                  <>
                    {event.fromStatus.name}
                    <MoveRightIcon className="size-3.5" />
                  </>
                ) : (
                  <MoveRightIcon className="size-3.5" />
                )}
                {event.toStatus.name}
              </span>
            )}
          </div>
          {event.note && (
            <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatDate({
                value: event.createdAt,
                withTime: true,
                monthFormat: 'long',
              })}
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3.5" />
              {event.createdBy.fullName}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

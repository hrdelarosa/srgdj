const EVENT_LABELS: Record<string, string> = {
  CREATED: 'Creado',
  STATUS_CHANGED: 'Cambio de estado',
  UPDATED: 'Actualizado',
}

export function eventLabel(type: string): string {
  return EVENT_LABELS[type] ?? type
}

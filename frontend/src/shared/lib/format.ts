export function formatPrice(value: number): string {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

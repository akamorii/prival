import type { Order } from '../types';
import { http } from './http';

export interface RangeReport {
  ordersCount: number;
  total: number;
  orders: Order[];
}

export function fetchReport(from: string, to: string): Promise<RangeReport> {
  return http.get<RangeReport>(`/api/reports?from=${from}&to=${to}`);
}

export function ordersToCsv(orders: Order[]): string {
  const header = ['Заказ', 'Стол', 'Дата', 'Время', 'Сумма', 'Статус', 'Комментарий', 'Состав'];
  const rows = orders.map((o) => [
    `№${o.id}`,
    `№${o.tableNumber}`,
    new Date(o.createdAt).toLocaleDateString('ru-RU'),
    new Date(o.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    String(o.total),
    o.status,
    o.comment.replace(/\n/g, ' '),
    o.items.map((i) => `${i.name} x${i.quantity}`).join('; '),
  ]);
  const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
  return [header, ...rows].map((row) => row.map(escape).join(';')).join('\n');
}

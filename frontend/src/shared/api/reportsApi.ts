import type { Order } from '../types';
import { FULFILLMENT_LABELS } from '../types';
import { http } from './http';

export interface RangeReport {
  ordersCount: number;
  total: number;
  orders: Order[];
}

export function fetchReport(from: string, to: string): Promise<RangeReport> {
  return http.get<RangeReport>(`/api/reports?from=${from}&to=${to}`);
}

function fulfillmentCell(order: Order): string {
  if (order.fulfillmentType === 'dine_in') return `Стол №${order.tableNumber}`;
  if (order.fulfillmentType === 'delivery' && order.address) {
    return `${FULFILLMENT_LABELS.delivery}, ${order.address}`;
  }
  return FULFILLMENT_LABELS[order.fulfillmentType];
}

export function ordersToCsv(orders: Order[]): string {
  const header = ['Заказ', 'Получение', 'Дата', 'Время', 'Сумма', 'Статус', 'Комментарий', 'Состав'];
  const rows = orders.map((o) => [
    `№${o.id}`,
    fulfillmentCell(o),
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

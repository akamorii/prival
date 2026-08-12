import type { CreateOrderPayload, Order, OrderStatus } from '../types';
import { delay, getOrdersDb, nextOrderId, setOrdersDb } from './db';

function notifyNewOrder(order: Order): void {
  // В продакшене здесь backend отправит письмо на Bigmadmuffin@yandex.ru.
  // Сбой уведомления не должен влиять на уже сохранённый заказ.
  console.info('[order notification]', order);
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const total = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order: Order = {
    id: nextOrderId(),
    tableNumber: payload.tableNumber,
    items: payload.items,
    comment: payload.comment,
    total,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  const orders = getOrdersDb();
  orders.push(order);
  setOrdersDb(orders);

  notifyNewOrder(order);

  return delay(() => order, 400);
}

export async function fetchOrders(): Promise<Order[]> {
  return delay(() => [...getOrdersDb()].sort((a, b) => b.id - a.id));
}

export async function fetchOrder(id: number): Promise<Order | undefined> {
  return delay(() => getOrdersDb().find((o) => o.id === id));
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
  const orders = getOrdersDb();
  const order = orders.find((o) => o.id === id);
  if (order) {
    order.status = status;
    setOrdersDb(orders);
  }
  return delay(() => undefined);
}

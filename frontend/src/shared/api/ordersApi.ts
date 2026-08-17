import type { CreateOrderPayload, Order, OrderStatus } from '../types';
import { ApiError, http } from './http';

export function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return http.post<Order>('/api/orders', payload);
}

export function fetchOrders(): Promise<Order[]> {
  return http.get<Order[]>('/api/orders');
}

export async function fetchOrder(id: number): Promise<Order | undefined> {
  try {
    return await http.get<Order>(`/api/orders/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  return http.patch<Order>(`/api/orders/${id}/status`, { status });
}

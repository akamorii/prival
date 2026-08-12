export type OrderStatus = 'new' | 'accepted' | 'ready' | 'closed';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  accepted: 'Принят',
  ready: 'Готов',
  closed: 'Закрыт',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = ['new', 'accepted', 'ready', 'closed'];

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Dish {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  composition: string;
  weight: string;
  price: number;
  photoUrl?: string;
  available: boolean;
}

export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  tableNumber: number;
  items: OrderItem[];
  total: number;
  comment: string;
  status: OrderStatus;
  createdAt: string;
}

export interface CreateOrderPayload {
  tableNumber: number;
  items: OrderItem[];
  comment: string;
}

export interface DailyStats {
  date: string;
  ordersCount: number;
  total: number;
}

export interface RangeStats {
  from: string;
  to: string;
  ordersCount: number;
  total: number;
}

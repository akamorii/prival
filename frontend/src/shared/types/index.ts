export type OrderStatus = 'new' | 'accepted' | 'ready' | 'closed';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  accepted: 'Принят',
  ready: 'Готов',
  closed: 'Закрыт',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = ['new', 'accepted', 'ready', 'closed'];

export type FulfillmentType = 'delivery' | 'pickup' | 'dine_in';

export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  delivery: 'Доставка',
  pickup: 'Самовывоз',
  dine_in: 'За столом',
};

export type PaymentMethod = 'cash' | 'card';

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Наличными',
  card: 'Картой',
};

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
  photoUrls: string[];
  available: boolean;
}

export interface InfoField {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
}

export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  tableNumber: number | null;
  items: OrderItem[];
  total: number;
  comment: string;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  address?: string;
  createdAt: string;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  comment: string;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  address?: string;
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

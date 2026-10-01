import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dish, FulfillmentType, OrderItem, PaymentMethod } from '../shared/types';

interface CartState {
  items: OrderItem[];
  comment: string;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  address: string;
  addItem: (dish: Dish, quantity?: number) => void;
  increment: (dishId: string) => void;
  decrement: (dishId: string) => void;
  removeItem: (dishId: string) => void;
  setComment: (comment: string) => void;
  setFulfillmentType: (type: FulfillmentType) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAddress: (address: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      comment: '',
      fulfillmentType: 'pickup',
      paymentMethod: 'cash',
      address: '',

      addItem: (dish, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.dishId === dish.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.dishId === dish.id ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { dishId: dish.id, name: dish.name, price: dish.price, quantity },
            ],
          });
        }
      },

      increment: (dishId) => {
        set({
          items: get().items.map((i) =>
            i.dishId === dishId ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        });
      },

      decrement: (dishId) => {
        const items = get().items
          .map((i) => (i.dishId === dishId ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0);
        set({ items });
      },

      removeItem: (dishId) => {
        set({ items: get().items.filter((i) => i.dishId !== dishId) });
      },

      setComment: (comment) => set({ comment }),

      setFulfillmentType: (fulfillmentType) => set({ fulfillmentType }),

      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

      setAddress: (address) => set({ address }),

      clear: () => set({ items: [], comment: '', address: '' }),
    }),
    { name: 'privalcafe:cart' },
  ),
);

export function cartTotal(items: OrderItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: OrderItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

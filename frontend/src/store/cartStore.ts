import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dish, OrderItem } from '../shared/types';

interface CartState {
  tableNumber: number | null;
  items: OrderItem[];
  comment: string;
  setTableNumber: (table: number) => void;
  addItem: (dish: Dish, quantity?: number) => void;
  increment: (dishId: string) => void;
  decrement: (dishId: string) => void;
  removeItem: (dishId: string) => void;
  setComment: (comment: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tableNumber: null,
      items: [],
      comment: '',

      setTableNumber: (table) => set({ tableNumber: table }),

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

      clear: () => set({ items: [], comment: '' }),
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

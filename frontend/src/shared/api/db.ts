import { seedCategories, seedDishes } from '../../mocks/menu';
import type { Category, Dish, Order } from '../types';
import { readStorage, writeStorage } from '../lib/storage';

export function delay<T>(getValue: () => T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(getValue()), ms));
}

export function getCategoriesDb(): Category[] {
  return readStorage('categories', seedCategories);
}

export function setCategoriesDb(categories: Category[]): void {
  writeStorage('categories', categories);
}

export function getDishesDb(): Dish[] {
  return readStorage('dishes', seedDishes);
}

export function setDishesDb(dishes: Dish[]): void {
  writeStorage('dishes', dishes);
}

export function getOrdersDb(): Order[] {
  return readStorage<Order[]>('orders', []);
}

export function setOrdersDb(orders: Order[]): void {
  writeStorage('orders', orders);
}

export function nextOrderId(): number {
  const seq = readStorage<number>('orderSeq', 1000);
  const next = seq + 1;
  writeStorage('orderSeq', next);
  return next;
}

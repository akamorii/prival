import type { Category, Dish } from '../types';
import { http } from './http';

export function fetchCategories(): Promise<Category[]> {
  return http.get<Category[]>('/api/categories');
}

export function fetchDishes(): Promise<Dish[]> {
  return http.get<Dish[]>('/api/dishes');
}

export function saveDish(dish: Dish): Promise<Dish> {
  return http.put<Dish>(`/api/dishes/${dish.id}`, dish);
}

export function deleteDish(dishId: string): Promise<void> {
  return http.delete<void>(`/api/dishes/${dishId}`);
}

export function setDishAvailability(dishId: string, available: boolean): Promise<Dish> {
  return http.patch<Dish>(`/api/dishes/${dishId}/availability`, { available });
}

export function saveCategory(category: Category): Promise<Category> {
  return http.put<Category>(`/api/categories/${category.id}`, category);
}

export function deleteCategory(categoryId: string): Promise<void> {
  return http.delete<void>(`/api/categories/${categoryId}`);
}

import type { Category, Dish } from '../types';
import { delay, getCategoriesDb, getDishesDb, setCategoriesDb, setDishesDb } from './db';

export async function fetchCategories(): Promise<Category[]> {
  return delay(() => [...getCategoriesDb()].sort((a, b) => a.sortOrder - b.sortOrder));
}

export async function fetchDishes(): Promise<Dish[]> {
  return delay(() => getDishesDb());
}

export async function saveDish(dish: Dish): Promise<Dish> {
  const dishes = getDishesDb();
  const index = dishes.findIndex((d) => d.id === dish.id);
  if (index >= 0) {
    dishes[index] = dish;
  } else {
    dishes.push(dish);
  }
  setDishesDb(dishes);
  return delay(() => dish);
}

export async function deleteDish(dishId: string): Promise<void> {
  setDishesDb(getDishesDb().filter((d) => d.id !== dishId));
  return delay(() => undefined);
}

export async function setDishAvailability(dishId: string, available: boolean): Promise<void> {
  const dishes = getDishesDb();
  const dish = dishes.find((d) => d.id === dishId);
  if (dish) {
    dish.available = available;
    setDishesDb(dishes);
  }
  return delay(() => undefined);
}

export async function saveCategory(category: Category): Promise<Category> {
  const categories = getCategoriesDb();
  const index = categories.findIndex((c) => c.id === category.id);
  if (index >= 0) {
    categories[index] = category;
  } else {
    categories.push(category);
  }
  setCategoriesDb(categories);
  return delay(() => category);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  setCategoriesDb(getCategoriesDb().filter((c) => c.id !== categoryId));
  setDishesDb(getDishesDb().filter((d) => d.categoryId !== categoryId));
  return delay(() => undefined);
}

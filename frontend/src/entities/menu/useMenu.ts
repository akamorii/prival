import { useEffect, useState } from 'react';
import type { Category, Dish } from '../../shared/types';
import { fetchCategories, fetchDishes } from '../../shared/api/menuApi';

interface MenuState {
  categories: Category[];
  dishes: Dish[];
  loading: boolean;
}

export function useMenu(): MenuState {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchCategories(), fetchDishes()]).then(([cats, ds]) => {
      if (cancelled) return;
      setCategories(cats);
      setDishes(ds);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, dishes, loading };
}

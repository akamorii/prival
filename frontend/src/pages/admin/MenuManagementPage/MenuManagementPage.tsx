import { useEffect, useState } from 'react';
import type { Category, Dish } from '../../../shared/types';
import {
  deleteCategory,
  deleteDish,
  fetchCategories,
  fetchDishes,
  saveCategory,
  saveDish,
  setDishAvailability,
} from '../../../shared/api/menuApi';
import { formatPrice } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/Button/Button';
import { DishFormModal } from './DishFormModal';
import styles from './MenuManagementPage.module.css';

export function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [editingDish, setEditingDish] = useState<Dish | null | undefined>(undefined);
  const [newCategoryName, setNewCategoryName] = useState('');

  const load = () => {
    fetchCategories().then(setCategories);
    fetchDishes().then(setDishes);
  };

  useEffect(load, []);

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    await saveCategory({ id: crypto.randomUUID(), name, sortOrder: categories.length + 1 });
    setNewCategoryName('');
    load();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Удалить категорию вместе со всеми блюдами в ней?')) return;
    await deleteCategory(id);
    load();
  };

  const handleToggleAvailability = async (dish: Dish) => {
    setDishes((prev) => prev.map((d) => (d.id === dish.id ? { ...d, available: !d.available } : d)));
    await setDishAvailability(dish.id, !dish.available);
  };

  const handleSaveDish = async (dish: Dish) => {
    await saveDish(dish);
    setEditingDish(undefined);
    load();
  };

  const handleDeleteDish = async (dishId: string) => {
    if (!confirm('Удалить блюдо?')) return;
    await deleteDish(dishId);
    setEditingDish(undefined);
    load();
  };

  return (
    <div>
      <div className={styles.categoryBar}>
        {categories.map((c) => (
          <div key={c.id} className={styles.categoryChip}>
            {c.name}
            <button
              type="button"
              className={styles.categoryChipDelete}
              onClick={() => handleDeleteCategory(c.id)}
              aria-label={`Удалить категорию ${c.name}`}
            >
              ×
            </button>
          </div>
        ))}
        <div className={styles.addCategoryForm}>
          <input
            className={styles.addCategoryInput}
            placeholder="Новая категория"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <Button size="sm" onClick={handleAddCategory}>
            +
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <span>{dishes.length} блюд(а)</span>
        <Button size="sm" onClick={() => setEditingDish(null)}>
          + Добавить блюдо
        </Button>
      </div>

      {categories.map((category) => {
        const items = dishes.filter((d) => d.categoryId === category.id);
        if (!items.length) return null;
        return (
          <div key={category.id}>
            <div className={styles.sectionTitle}>{category.name}</div>
            {items.map((dish) => (
              <div key={dish.id} className={styles.dishRow}>
                <div className={styles.dishInfo} onClick={() => setEditingDish(dish)}>
                  <div className={styles.dishName}>
                    {dish.name} {!dish.available && <span className={styles.hiddenTag}>· скрыто</span>}
                  </div>
                  <div className={styles.dishMeta}>
                    {formatPrice(dish.price)} · {dish.weight}
                  </div>
                </div>
                <button type="button" className={styles.toggleBtn} onClick={() => handleToggleAvailability(dish)}>
                  {dish.available ? 'Скрыть' : 'Показать'}
                </button>
              </div>
            ))}
          </div>
        );
      })}

      {editingDish !== undefined && (
        <DishFormModal
          dish={editingDish}
          categories={categories}
          onSave={handleSaveDish}
          onDelete={editingDish ? handleDeleteDish : undefined}
          onClose={() => setEditingDish(undefined)}
        />
      )}
    </div>
  );
}

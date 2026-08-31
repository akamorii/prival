import { useState } from 'react';
import type { Category, Dish } from '../../../shared/types';
import { Button } from '../../../shared/ui/Button/Button';
import { ImageDropzone } from './ImageDropzone';
import styles from './DishFormModal.module.css';

interface DishFormModalProps {
  dish: Dish | null;
  categories: Category[];
  onSave: (dish: Dish) => void;
  onDelete?: (dishId: string) => void;
  onClose: () => void;
}

function emptyDish(categoryId: string): Dish {
  return {
    id: crypto.randomUUID(),
    categoryId,
    name: '',
    description: '',
    composition: '',
    weight: '',
    price: 0,
    available: true,
  };
}

export function DishFormModal({ dish, categories, onSave, onDelete, onClose }: DishFormModalProps) {
  const [draft, setDraft] = useState<Dish>(dish ?? emptyDish(categories[0]?.id ?? ''));

  const update = <K extends keyof Dish>(key: K, value: Dish[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSubmit = () => {
    if (!draft.name.trim() || !draft.categoryId) return;
    onSave(draft);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>{dish ? 'Редактировать блюдо' : 'Новое блюдо'}</div>

        <div className={styles.field}>
          <label className={styles.label}>Название</label>
          <input className={styles.input} value={draft.name} onChange={(e) => update('name', e.target.value)} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Категория</label>
          <select
            className={styles.select}
            value={draft.categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Описание</label>
          <textarea
            className={styles.textarea}
            value={draft.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Состав</label>
          <textarea
            className={styles.textarea}
            value={draft.composition}
            onChange={(e) => update('composition', e.target.value)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Вес</label>
            <input className={styles.input} value={draft.weight} onChange={(e) => update('weight', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Цена, ₽</label>
            <input
              className={styles.input}
              type="number"
              min={0}
              value={draft.price}
              onChange={(e) => update('price', Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Фото 1 (необязательно)</label>
          <ImageDropzone value={draft.photoUrl} onChange={(url) => update('photoUrl', url)} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Фото 2 (необязательно)</label>
          <ImageDropzone value={draft.photoUrl2} onChange={(url) => update('photoUrl2', url)} />
        </div>

        <div className={styles.checkboxRow}>
          <input
            id="dish-available"
            type="checkbox"
            checked={draft.available}
            onChange={(e) => update('available', e.target.checked)}
          />
          <label htmlFor="dish-available">Доступно для заказа</label>
        </div>

        <div className={styles.actions}>
          {dish && onDelete && (
            <Button variant="danger" onClick={() => onDelete(dish.id)}>
              Удалить
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
}

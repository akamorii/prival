import type { Dish } from '../../shared/types';
import { formatPrice } from '../../shared/lib/format';
import { DishThumb } from '../../shared/ui/DishThumb/DishThumb';
import { useCartStore } from '../../store/cartStore';
import styles from './DishCard.module.css';

interface DishCardProps {
  dish: Dish;
  onOpen: (dish: Dish) => void;
}

export function DishCard({ dish, onOpen }: DishCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <button
      type="button"
      className={`${styles.card} ${!dish.available ? styles.unavailable : ''}`}
      onClick={() => onOpen(dish)}
    >
      <DishThumb categoryId={dish.categoryId} photoUrl={dish.photoUrl} />
      <div className={styles.info}>
        <div className={styles.name}>{dish.name}</div>
        <div className={styles.weight}>{dish.weight}</div>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(dish.price)}</span>
          {!dish.available && <span className={styles.unavailableTag}>Нет в наличии</span>}
        </div>
      </div>
      {dish.available && (
        <span
          className={styles.addBtn}
          role="button"
          aria-label={`Добавить ${dish.name}`}
          onClick={(e) => {
            e.stopPropagation();
            addItem(dish);
          }}
        >
          +
        </span>
      )}
    </button>
  );
}

import { useState } from 'react';
import type { Dish } from '../../shared/types';
import { formatPrice } from '../../shared/lib/format';
import { PhotoCarousel } from '../../shared/ui/PhotoCarousel/PhotoCarousel';
import { Stepper } from '../../shared/ui/Stepper/Stepper';
import { Button } from '../../shared/ui/Button/Button';
import { useCartStore } from '../../store/cartStore';
import styles from './DishModal.module.css';

interface DishModalProps {
  dish: Dish;
  onClose: () => void;
}

export function DishModal({ dish, onClose }: DishModalProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.closeRow}>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <div className={styles.photoWrap}>
          <PhotoCarousel categoryId={dish.categoryId} photoUrls={[dish.photoUrl, dish.photoUrl2]} size={240} fontSize={52} />
        </div>
        <div className={styles.name}>{dish.name}</div>
        <div className={styles.weight}>{dish.weight}</div>
        <p className={styles.description}>{dish.description}</p>
        <p className={styles.composition}>Состав: {dish.composition}</p>

        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(dish.price * quantity)}</span>
          <Stepper
            value={quantity}
            min={1}
            onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrease={() => setQuantity((q) => q + 1)}
          />
        </div>

        <Button
          fullWidth
          style={{ marginTop: 16 }}
          disabled={!dish.available}
          onClick={() => {
            addItem(dish, quantity);
            onClose();
          }}
        >
          {dish.available ? 'Добавить в заказ' : 'Нет в наличии'}
        </Button>
      </div>
    </div>
  );
}

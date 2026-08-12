import type { OrderItem } from '../../shared/types';
import { formatPrice } from '../../shared/lib/format';
import { Stepper } from '../../shared/ui/Stepper/Stepper';
import styles from './OrderItemsList.module.css';

interface OrderItemsListProps {
  items: OrderItem[];
  editable?: boolean;
  onIncrement?: (dishId: string) => void;
  onDecrement?: (dishId: string) => void;
  onRemove?: (dishId: string) => void;
}

export function OrderItemsList({
  items,
  editable = false,
  onIncrement,
  onDecrement,
  onRemove,
}: OrderItemsListProps) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.dishId} className={styles.row}>
          <div className={styles.info}>
            <div className={styles.name}>{item.name}</div>
            <div className={styles.linePrice}>
              {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.price * item.quantity)}
            </div>
            {editable && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onRemove?.(item.dishId)}
              >
                Удалить
              </button>
            )}
          </div>
          {editable ? (
            <Stepper
              value={item.quantity}
              min={1}
              onDecrease={() => onDecrement?.(item.dishId)}
              onIncrease={() => onIncrement?.(item.dishId)}
            />
          ) : (
            <span className={styles.staticQty}>× {item.quantity}</span>
          )}
        </div>
      ))}
    </div>
  );
}

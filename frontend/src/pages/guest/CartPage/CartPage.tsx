import { useNavigate } from 'react-router-dom';
import { cartTotal, useCartStore } from '../../../store/cartStore';
import { formatPrice } from '../../../shared/lib/format';
import { OrderItemsList } from '../../../widgets/order-items-list/OrderItemsList';
import { EmptyState } from '../../../shared/ui/EmptyState/EmptyState';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './CartPage.module.css';

export function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);

  const total = cartTotal(items);

  return (
    <div>
      <div className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/')} aria-label="Назад в меню">
          ←
        </button>
        <span className={styles.title}>Мой заказ</span>
      </div>

      <div className="container">
        {items.length === 0 ? (
          <EmptyState icon="🛒" title="Корзина пуста">
            <Button variant="outline" onClick={() => navigate('/')}>
              Перейти в меню
            </Button>
          </EmptyState>
        ) : (
          <>
            <OrderItemsList
              items={items}
              editable
              onIncrement={increment}
              onDecrement={decrement}
              onRemove={removeItem}
            />
            <div className={styles.bottomSpacer} />
          </>
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.totalRow}>
              <span>Итого</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button fullWidth onClick={() => navigate('/checkout')}>
              Оформить заказ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

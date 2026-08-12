import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartTotal, useCartStore } from '../../../store/cartStore';
import { formatPrice } from '../../../shared/lib/format';
import { createOrder } from '../../../shared/api/ordersApi';
import { OrderItemsList } from '../../../widgets/order-items-list/OrderItemsList';
import { TableIndicator } from '../../../widgets/table-indicator/TableIndicator';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './CheckoutPage.module.css';

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const comment = useCartStore((s) => s.comment);
  const setComment = useCartStore((s) => s.setComment);
  const clear = useCartStore((s) => s.clear);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = cartTotal(items);

  const handleSubmit = async () => {
    if (!tableNumber) {
      setError('Укажите номер стола');
      return;
    }
    if (items.length === 0) {
      setError('Корзина пуста');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const order = await createOrder({ tableNumber, items, comment });
      clear();
      navigate(`/order/${order.id}`);
    } catch {
      setError('Не удалось отправить заказ. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/cart')} aria-label="Назад">
          ←
        </button>
        <span className={styles.title}>Оформление заказа</span>
      </div>

      <div className="container">
        <TableIndicator />

        <OrderItemsList items={items} />
        <div className={styles.totalRow}>
          <span>Итого</span>
          <span>{formatPrice(total)}</span>
        </div>

        <label className={styles.commentLabel} htmlFor="order-comment">
          Комментарий к заказу (необязательно)
        </label>
        <textarea
          id="order-comment"
          className={styles.textarea}
          placeholder="Например: без лука, дополнительный соус"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.submitWrap}>
          <Button fullWidth onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Отправляем…' : 'Отправить заказ'}
          </Button>
        </div>
      </div>
    </div>
  );
}

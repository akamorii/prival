import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartTotal, useCartStore } from '../../../store/cartStore';
import { formatPrice } from '../../../shared/lib/format';
import { createOrder } from '../../../shared/api/ordersApi';
import { FULFILLMENT_LABELS, PAYMENT_LABELS, type FulfillmentType, type PaymentMethod } from '../../../shared/types';
import { OrderItemsList } from '../../../widgets/order-items-list/OrderItemsList';
import { TableIndicator } from '../../../widgets/table-indicator/TableIndicator';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './CheckoutPage.module.css';

const FULFILLMENT_OPTIONS: FulfillmentType[] = ['dine_in', 'pickup', 'delivery'];
const PAYMENT_OPTIONS: PaymentMethod[] = ['cash', 'card'];

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const comment = useCartStore((s) => s.comment);
  const setComment = useCartStore((s) => s.setComment);
  const fulfillmentType = useCartStore((s) => s.fulfillmentType);
  const setFulfillmentType = useCartStore((s) => s.setFulfillmentType);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const address = useCartStore((s) => s.address);
  const setAddress = useCartStore((s) => s.setAddress);
  const clear = useCartStore((s) => s.clear);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = cartTotal(items);

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError('Корзина пуста');
      return;
    }
    if (fulfillmentType === 'dine_in' && !tableNumber) {
      setError('Укажите номер стола');
      return;
    }
    if (fulfillmentType === 'delivery' && !address.trim()) {
      setError('Укажите адрес доставки');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const order = await createOrder({
        tableNumber: fulfillmentType === 'dine_in' ? tableNumber : null,
        items,
        comment,
        fulfillmentType,
        paymentMethod,
        address: fulfillmentType === 'delivery' ? address.trim() : undefined,
      });
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
        <span className={styles.commentLabel}>Как получить заказ</span>
        <div className={styles.optionRow}>
          {FULFILLMENT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`${styles.optionBtn} ${fulfillmentType === option ? styles.optionBtnActive : ''}`}
              onClick={() => setFulfillmentType(option)}
            >
              {FULFILLMENT_LABELS[option]}
            </button>
          ))}
        </div>

        {fulfillmentType === 'dine_in' && <TableIndicator />}

        {fulfillmentType === 'delivery' && (
          <>
            <label className={styles.commentLabel} htmlFor="order-address">
              Адрес доставки
            </label>
            <textarea
              id="order-address"
              className={styles.textarea}
              placeholder="Улица, дом, квартира, подъезд/домофон"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </>
        )}

        <span className={styles.commentLabel}>Способ оплаты</span>
        <div className={styles.optionRow}>
          {PAYMENT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`${styles.optionBtn} ${paymentMethod === option ? styles.optionBtnActive : ''}`}
              onClick={() => setPaymentMethod(option)}
            >
              {PAYMENT_LABELS[option]}
            </button>
          ))}
        </div>
        <p className={styles.paymentHint}>
          Онлайн-оплата картой на сайте пока не подключена — оплата принимается на месте или у курьера.
        </p>

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

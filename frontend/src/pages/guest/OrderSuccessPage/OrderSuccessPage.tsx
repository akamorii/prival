import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Order } from '../../../shared/types';
import { fetchOrder } from '../../../shared/api/ordersApi';
import { formatPrice } from '../../../shared/lib/format';
import { OrderItemsList } from '../../../widgets/order-items-list/OrderItemsList';
import { EmptyState } from '../../../shared/ui/EmptyState/EmptyState';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './OrderSuccessPage.module.css';

export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    fetchOrder(Number(id)).then((o) => setOrder(o ?? null));
  }, [id]);

  if (order === undefined) {
    return <div className={styles.loading}>Загружаем заказ…</div>;
  }

  if (order === null) {
    return (
      <div className="container">
        <EmptyState icon="❓" title="Заказ не найден">
          <Button variant="outline" onClick={() => navigate('/')}>
            Вернуться в меню
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.wrap}>
        <div className={styles.icon}>✅</div>
        <div className={styles.title}>Заказ отправлен!</div>
        <div className={styles.subtitle}>
          Ваш заказ №{order.id} принят.
          <br />
          Ожидайте приготовления.
        </div>
      </div>

      <div className={styles.summary}>
        <OrderItemsList items={order.items} />
        <div className={styles.totalRow}>
          <span>Итого</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button fullWidth onClick={() => navigate('/')}>
          Вернуться в меню
        </Button>
      </div>
    </div>
  );
}

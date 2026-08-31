import { useEffect, useState } from 'react';
import type { Order, OrderStatus } from '../../../shared/types';
import { FULFILLMENT_LABELS, ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, PAYMENT_LABELS } from '../../../shared/types';
import { fetchOrders, updateOrderStatus } from '../../../shared/api/ordersApi';
import { formatDateTime, formatPrice } from '../../../shared/lib/format';
import { StatusBadge } from '../../../shared/ui/Badge/Badge';
import { OrderItemsList } from '../../../widgets/order-items-list/OrderItemsList';
import { EmptyState } from '../../../shared/ui/EmptyState/EmptyState';
import styles from './OrdersPage.module.css';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetchOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    await updateOrderStatus(order.id, status);
  };

  if (loading) return <p>Загрузка…</p>;

  if (orders.length === 0) {
    return <EmptyState icon="🧾" title="Заказов пока нет" />;
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <span>{orders.length} заказ(ов)</span>
        <button type="button" className={styles.refreshBtn} onClick={load}>
          Обновить
        </button>
      </div>

      {orders.map((order) => {
        const expanded = expandedId === order.id;
        return (
          <div key={order.id} className={styles.card}>
            <div className={styles.cardHead} onClick={() => setExpandedId(expanded ? null : order.id)}>
              <div>
                <strong>№{order.id}</strong>
                <div className={styles.orderMeta}>
                  {order.fulfillmentType === 'dine_in' ? `Стол №${order.tableNumber}` : FULFILLMENT_LABELS[order.fulfillmentType]}
                  {' · '}
                  {formatDateTime(order.createdAt)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={styles.orderTotal}>{formatPrice(order.total)}</div>
                <StatusBadge status={order.status} />
              </div>
            </div>

            {expanded && (
              <div className={styles.detail}>
                <div className={styles.comment}>
                  Оплата: {PAYMENT_LABELS[order.paymentMethod]}
                  {order.fulfillmentType === 'delivery' && order.address && ` · Адрес: ${order.address}`}
                </div>
                <OrderItemsList items={order.items} />
                {order.comment && <div className={styles.comment}>Комментарий: {order.comment}</div>}
                <div className={styles.statusRow}>
                  {ORDER_STATUS_FLOW.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`${styles.statusBtn} ${order.status === status ? styles.statusBtnActive : ''}`}
                      onClick={() => handleStatusChange(order, status)}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import type { OrderStatus } from '../../types';
import { ORDER_STATUS_LABELS } from '../../types';
import styles from './Badge.module.css';

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{ORDER_STATUS_LABELS[status]}</span>;
}

import { useNavigate } from 'react-router-dom';
import { cartCount, cartTotal, useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../shared/lib/format';
import styles from './CartBar.module.css';

export function CartBar() {
  const items = useCartStore((s) => s.items);
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const count = cartCount(items);
  const total = cartTotal(items);

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.bar} onClick={() => navigate('/cart')}>
        <span>
          <span className={styles.count}>{count}</span>
          Мой заказ
        </span>
        <span>{formatPrice(total)}</span>
      </button>
    </div>
  );
}

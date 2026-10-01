import { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { FULFILLMENT_LABELS, type FulfillmentType } from '../../shared/types';
import styles from './FulfillmentIndicator.module.css';

const FULFILLMENT_OPTIONS: Extract<FulfillmentType, 'pickup' | 'delivery'>[] = ['pickup', 'delivery'];

export function FulfillmentIndicator() {
  const fulfillmentType = useCartStore((s) => s.fulfillmentType);
  const setFulfillmentType = useCartStore((s) => s.setFulfillmentType);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className={styles.editWrap}>
        <div className={styles.optionRow}>
          {FULFILLMENT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`${styles.optionBtn} ${fulfillmentType === option ? styles.optionBtnActive : ''}`}
              onClick={() => {
                setFulfillmentType(option);
                setEditing(false);
              }}
            >
              {FULFILLMENT_LABELS[option]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <span>{FULFILLMENT_LABELS[fulfillmentType]}</span>
      <button type="button" className={styles.editBtn} onClick={() => setEditing(true)}>
        Изменить
      </button>
    </div>
  );
}

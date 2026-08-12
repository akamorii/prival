import { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import styles from './TableIndicator.module.css';

export function TableIndicator() {
  const tableNumber = useCartStore((s) => s.tableNumber);
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(tableNumber ?? ''));

  if (editing) {
    return (
      <div className={styles.wrap}>
        <div className={styles.editRow}>
          <span>Стол №</span>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={1}
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="button"
            className={styles.saveBtn}
            onClick={() => {
              const num = Number.parseInt(draft, 10);
              if (Number.isFinite(num) && num > 0) {
                setTableNumber(num);
                setEditing(false);
              }
            }}
          >
            Готово
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <span>{tableNumber ? `Вы за столом №${tableNumber}` : 'Стол не выбран'}</span>
      <button
        type="button"
        className={styles.editBtn}
        onClick={() => {
          setDraft(String(tableNumber ?? ''));
          setEditing(true);
        }}
      >
        Изменить
      </button>
    </div>
  );
}

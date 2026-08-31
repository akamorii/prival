import { useEffect, useState } from 'react';
import type { InfoField } from '../../shared/types';
import { fetchInfoFields } from '../../shared/api/infoFieldsApi';
import styles from './InfoPanel.module.css';

interface InfoPanelProps {
  open: boolean;
  onClose: () => void;
}

export function InfoPanel({ open, onClose }: InfoPanelProps) {
  const [fields, setFields] = useState<InfoField[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open && !loaded) {
      fetchInfoFields().then((data) => {
        setFields(data);
        setLoaded(true);
      });
    }
  }, [open, loaded]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Информация</span>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        {fields.length === 0 ? (
          <p className={styles.empty}>Информация пока не заполнена</p>
        ) : (
          <dl className={styles.list}>
            {fields.map((field) => (
              <div key={field.id} className={styles.row}>
                <dt className={styles.label}>{field.label}</dt>
                <dd className={styles.value}>{field.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

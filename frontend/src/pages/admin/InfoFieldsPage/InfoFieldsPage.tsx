import { useEffect, useState } from 'react';
import type { InfoField } from '../../../shared/types';
import { deleteInfoField, fetchInfoFields, saveInfoField } from '../../../shared/api/infoFieldsApi';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './InfoFieldsPage.module.css';

export function InfoFieldsPage() {
  const [fields, setFields] = useState<InfoField[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const load = () => {
    fetchInfoFields().then((data) => {
      setFields(data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const updateField = (id: string, patch: Partial<InfoField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const handleSaveField = async (field: InfoField) => {
    await saveInfoField(field);
  };

  const handleDeleteField = async (id: string) => {
    if (!confirm('Удалить поле?')) return;
    await deleteInfoField(id);
    load();
  };

  const handleAddField = async () => {
    const label = newLabel.trim();
    if (!label) return;
    await saveInfoField({ id: crypto.randomUUID(), label, value: newValue.trim(), sortOrder: fields.length });
    setNewLabel('');
    setNewValue('');
    load();
  };

  if (loading) return <p>Загрузка…</p>;

  return (
    <div>
      <p className={styles.hint}>
        Эти поля видны гостям в боковой панели «Информация» на главной странице (реквизиты, адрес, телефон и т.д.)
      </p>

      {fields.map((field) => (
        <div key={field.id} className={styles.row}>
          <input
            className={styles.labelInput}
            placeholder="Название"
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
          />
          <input
            className={styles.valueInput}
            placeholder="Значение"
            value={field.value}
            onChange={(e) => updateField(field.id, { value: e.target.value })}
          />
          <button type="button" className={styles.iconBtn} onClick={() => handleSaveField(field)} aria-label="Сохранить">
            💾
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => handleDeleteField(field.id)}
            aria-label="Удалить"
          >
            ✕
          </button>
        </div>
      ))}

      <div className={styles.addForm}>
        <input
          className={styles.labelInput}
          placeholder="Название (например, ИНН)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <input
          className={styles.valueInput}
          placeholder="Значение"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
        />
        <Button size="sm" onClick={handleAddField}>
          + Добавить
        </Button>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAdminAuthed, loginAdmin } from '../../../shared/lib/useAdminAuth';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './AdminLoginPage.module.css';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isAdminAuthed()) {
    return <Navigate to="/admin/orders" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await loginAdmin(passcode);
    setSubmitting(false);
    if (ok) {
      navigate('/admin/orders');
    } else {
      setError(true);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.logo}>Привал</div>
      <div className={styles.subtitle}>Вход в админ-панель</div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="password"
          placeholder="Код доступа"
          value={passcode}
          autoFocus
          onChange={(e) => {
            setPasscode(e.target.value);
            setError(false);
          }}
        />
        {error && <span className={styles.error}>Неверный код доступа</span>}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Входим…' : 'Войти'}
        </Button>
      </form>
    </div>
  );
}

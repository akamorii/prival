import { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../../../shared/api/settingsApi';
import { ApiError } from '../../../shared/api/http';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const [smtpEmail, setSmtpEmail] = useState('');
  const [smtpAppPassword, setSmtpAppPassword] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [passwordSet, setPasswordSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetchSettings().then((s) => {
      setSmtpEmail(s.smtpEmail ?? '');
      setNotifyEmail(s.notifyEmail ?? '');
      setPasswordSet(s.passwordSet);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    setStatus(null);
    if (!smtpEmail.trim() || !notifyEmail.trim()) {
      setStatus({ ok: false, text: 'Заполните email отправителя и email для уведомлений' });
      return;
    }
    setSaving(true);
    try {
      const result = await updateSettings({
        smtpEmail: smtpEmail.trim(),
        notifyEmail: notifyEmail.trim(),
        smtpAppPassword: smtpAppPassword.trim() || undefined,
      });
      setPasswordSet(result.passwordSet);
      setSmtpAppPassword('');
      setStatus({ ok: true, text: 'Настройки сохранены' });
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'Не удалось сохранить настройки';
      setStatus({ ok: false, text });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Загрузка…</p>;

  return (
    <div>
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="smtp-email">
            Email отправителя
          </label>
          <input
            id="smtp-email"
            className={styles.input}
            type="email"
            placeholder="cafe@yandex.ru"
            value={smtpEmail}
            onChange={(e) => setSmtpEmail(e.target.value)}
          />
          <span className={styles.hint}>С этого адреса будут отправляться письма о новых заказах</span>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="smtp-password">
            Пароль приложения
          </label>
          <input
            id="smtp-password"
            className={styles.input}
            type="password"
            placeholder={passwordSet ? '••••••••  (сохранён, оставьте пустым)' : 'Пароль приложения почты'}
            value={smtpAppPassword}
            onChange={(e) => setSmtpAppPassword(e.target.value)}
          />
          <span className={styles.hint}>
            Не обычный пароль от почты, а отдельный пароль приложения (создаётся в настройках безопасности
            почтового ящика — Yandex, Gmail и т.д.)
          </span>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="notify-email">
            Email для уведомлений о заказах
          </label>
          <input
            id="notify-email"
            className={styles.input}
            type="email"
            placeholder="owner@yandex.ru"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
          />
          <span className={styles.hint}>Куда будут приходить письма о каждом новом заказе</span>
        </div>

        {status && (
          <span className={`${styles.status} ${status.ok ? styles.statusOk : styles.statusError}`}>
            {status.text}
          </span>
        )}

        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Сохраняем…' : 'Сохранить'}
        </Button>
      </div>

      <p className={styles.section}>
        Если письмо не удалось отправить (не настроено или недоступен сервер почты), заказ всё равно
        сохраняется — уведомление можно будет отправить повторно после исправления настроек.
      </p>
    </div>
  );
}

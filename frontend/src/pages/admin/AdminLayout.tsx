import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { isAdminAuthed, logoutAdmin } from '../../shared/lib/useAdminAuth';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/admin/orders', label: 'Заказы' },
  { to: '/admin/menu', label: 'Меню' },
  { to: '/admin/tables', label: 'QR-код' },
  { to: '/admin/reports', label: 'Отчёты' },
  { to: '/admin/info', label: 'Информация' },
  { to: '/admin/settings', label: 'Настройки' },
];

export function AdminLayout() {
  const navigate = useNavigate();

  if (!isAdminAuthed()) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div>
      <div className={`${styles.header} no-print`}>
        <span className={styles.title}>Привал · Админка</span>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={() => {
            logoutAdmin();
            navigate('/admin/login');
          }}
        >
          Выйти
        </button>
      </div>
      <nav className={`${styles.nav} no-print`}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

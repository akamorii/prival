import { Outlet } from 'react-router-dom';
import { useTableFromUrl } from '../../shared/lib/useTableFromUrl';

export function GuestLayout() {
  useTableFromUrl();
  return <Outlet />;
}

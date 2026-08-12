import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GuestLayout } from '../pages/guest/GuestLayout';
import { MenuPage } from '../pages/guest/MenuPage/MenuPage';
import { CartPage } from '../pages/guest/CartPage/CartPage';
import { CheckoutPage } from '../pages/guest/CheckoutPage/CheckoutPage';
import { OrderSuccessPage } from '../pages/guest/OrderSuccessPage/OrderSuccessPage';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage/AdminLoginPage';
import { OrdersPage } from '../pages/admin/OrdersPage/OrdersPage';
import { MenuManagementPage } from '../pages/admin/MenuManagementPage/MenuManagementPage';
import { TablesQrPage } from '../pages/admin/TablesQrPage/TablesQrPage';
import { ReportsPage } from '../pages/admin/ReportsPage/ReportsPage';

export const router = createBrowserRouter([
  {
    element: <GuestLayout />,
    children: [
      { path: '/', element: <MenuPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/order/:id', element: <OrderSuccessPage /> },
    ],
  },
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="orders" replace /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'menu', element: <MenuManagementPage /> },
      { path: 'tables', element: <TablesQrPage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
]);

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { CustomersList } from '../pages/customers/CustomersList';
import { CustomerDetail } from '../pages/customers/CustomerDetail';
import { CustomerForm } from '../pages/customers/CustomerForm';
import { ProductsList } from '../pages/products/ProductsList';
import { ProductForm } from '../pages/products/ProductForm';
import { ChallansList } from '../pages/challans/ChallansList';
import { ChallanDetail } from '../pages/challans/ChallanDetail';
import { ChallanForm } from '../pages/challans/ChallanForm';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            path: '',
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: 'dashboard',
            element: <Dashboard />
          },
          {
            path: 'customers',
            children: [
              { path: '', element: <CustomersList /> },
              { path: ':id', element: <CustomerDetail /> },
              {
                element: <RoleRoute allowedRoles={['admin', 'sales']} />,
                children: [
                  { path: 'new', element: <CustomerForm /> },
                  { path: ':id/edit', element: <CustomerForm /> }
                ]
              }
            ]
          },
          {
            path: 'products',
            children: [
              { path: '', element: <ProductsList /> },
              {
                element: <RoleRoute allowedRoles={['admin', 'warehouse']} />,
                children: [
                  { path: 'new', element: <ProductForm /> },
                  { path: ':id/edit', element: <ProductForm /> }
                ]
              }
            ]
          },
          {
            path: 'challans',
            children: [
              { path: '', element: <ChallansList /> },
              { path: ':id', element: <ChallanDetail /> },
              {
                element: <RoleRoute allowedRoles={['admin', 'sales']} />,
                children: [
                  { path: 'new', element: <ChallanForm /> },
                  { path: ':id/edit', element: <ChallanForm /> }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);
export default router;

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { HomePage } from '@/pages/home';
import { BookingCatalogPage, BookingSlotsPage } from '@/pages/booking';
import { AdminPage } from '@/pages/admin';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'booking', element: <BookingCatalogPage /> },
      { path: 'booking/:eventTypeId', element: <BookingSlotsPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

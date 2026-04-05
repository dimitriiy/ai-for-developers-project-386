import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from '../App';
import { CountdownPage } from '@/pages/countdown';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/countdown',
    element: <CountdownPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

import { Outlet } from 'react-router-dom';
import { Header } from '@/widgets/header';

export const RootLayout = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
  </>
);

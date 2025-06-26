import MainLayout from '@/layouts/main/layout';
import { ReactNode } from 'react';
import { AuthGuard } from '@/auth/guard';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>{children}</MainLayout>
  )
}

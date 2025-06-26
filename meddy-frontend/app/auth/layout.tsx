import { ReactNode } from 'react';
import { GuestGuard } from '@/auth/guard';
import AuthLayout from '@/layouts/auth/layout';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  )
}

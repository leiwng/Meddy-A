'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks';
import { useRouter } from 'next/navigation';
import { LoadingScreen } from '@/components/loading-screen';

export function GuestGuard({ children }) {
  const router = useRouter();

  const { loading, authenticated } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const returnTo = '/';

  const checkPermissions = async () => {
    if (loading) {
      return;
    }

    if (authenticated) {
      router.replace(returnTo);
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading]);

  if (isChecking) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

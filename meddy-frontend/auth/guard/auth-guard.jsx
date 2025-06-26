'use client'

import { useState, useEffect, useCallback } from 'react'

import { LoadingScreen } from '@/components/loading-screen'

import { useAuthContext } from '../hooks'
import { useRouter, usePathname } from 'next/navigation'
// ----------------------------------------------------------------------

export function AuthGuard({ children }) {
  const router = useRouter()

  const { authenticated, loading } = useAuthContext()

  const [isChecking, setIsChecking] = useState(true)

  const pathname = usePathname()

  const checkPermissions = async () => {
    if (loading) {
      return
    }

    if (!authenticated) {
      setIsChecking(false)
      window.location.href = '/auth/signin'
      return
    }
    setIsChecking(false)
  }

  const checkGuestPermissions = async () => {
    if (loading) {
      return
    }

    if (authenticated) {
      router.replace('/')
      return
    }

    setIsChecking(false)
  }

  useEffect(() => {
    if (pathname === '/term-use' || pathname === '/privacy-policy') {
      setIsChecking(false);
      return;
    }

    if (
      pathname === '/auth/signin' ||
      pathname === '/auth/signup' ||
      pathname === '/auth/forgot-password' ||
      pathname === '/auth/user-pwd'
    ) {
      checkGuestPermissions()
      return
    }
    checkPermissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading, pathname])

  if (isChecking) {
    return <LoadingScreen />
  }

  return <>{children}</>
}

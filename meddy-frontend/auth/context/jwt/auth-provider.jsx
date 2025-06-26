'use client';

import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from '@/hooks/use-set-state';

import axios, { endpoints } from '@/utils/axios';

import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';
import { getCookie, setCookie } from '@/utils/cookies';
import { USER_ID_COOKIE_NAME } from '@/utils/constants';

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const res = await axios.get(endpoints.auth.me);

        const { username, role} = res.data;

        setState({ user: { role, userId: username, username, accessToken }, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // if (state.user) return;
    // const userIdCookie = getCookie(USER_ID_COOKIE_NAME);
    // console.log('start', userIdCookie);
    // if (userIdCookie) {
    //   setState({ user: { userId: userIdCookie, accessToken: 'asdasdasd', }, loading: false });
    // } else {
    //   const newUserId = generateRandomId();
    //   setState({ user: { userId: newUserId, accessToken: 'asdasdasd', }, loading: false });
    //   setCookie(USER_ID_COOKIE_NAME, newUserId);
    // }
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? state.user
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

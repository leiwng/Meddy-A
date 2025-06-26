import { useEffect, useState } from 'react';
import { getCookie, setCookie } from '../utils/cookies';
import { USER_ID_COOKIE_NAME } from '../utils/constants';
import { generateRandomId } from '@/utils/util';

export function useUser() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    if (userId) return;
    const userIdCookie = getCookie(USER_ID_COOKIE_NAME);
    console.log('start', userIdCookie);
    if (userIdCookie) {
      setUserId(userIdCookie);
    } else {
      console.log('ddd11111');
      const newUserId = generateRandomId();
      setUserId(newUserId);
      setCookie(USER_ID_COOKIE_NAME, newUserId);
    }
  }, []);

  return {
    userId,
  };
}

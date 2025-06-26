'use client';

import axios, { endpoints } from '@/utils/axios';

import { setSession } from './utils';
import { STORAGE_KEY } from './constant';

export const signInWithPhone = async ({ phone }) => {
  try {
    const params = { phone };
    const res = await axios.post(endpoints.auth.signInWithPhone, params);
    console.log('res', res)
    const { access_token: accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
}
/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ username, password }) => {
  try {
    // const params = { username, password };
    const params = `username=${username}&password=${password}`
    const res = await axios.post(endpoints.auth.signIn, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    console.log('res', res)
    const { access_token: accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ username, password, firstName, lastName }) => {
  const params = {
    username,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

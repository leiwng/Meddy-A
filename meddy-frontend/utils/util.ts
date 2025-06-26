import { CONFIG } from '@/config-global';
import { STORAGE_KEY } from '@/auth/context/jwt/constant';
import { Client } from "@langchain/langgraph-sdk";

export function generateRandomId(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const cryptoValues = new Uint32Array(length);
  crypto.getRandomValues(cryptoValues);

  for (let i = 0; i < length; i++) {
    result += chars[cryptoValues[i] % chars.length];
  }
  return result;
}

export const createClient = () => {
  const apiUrl = CONFIG.serverUrl;
  const accessToken = sessionStorage.getItem(STORAGE_KEY);
  return new Client({
    apiUrl,
    defaultHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export function handleError(error: any, dftstr = '') {
      let txt = dftstr;
      if (typeof error === 'string') {
        txt = error;
      }else if (Array.isArray(error.detail)) {
        txt = error.detail[0].msg;
      }else{
        txt = error.detail;
      }
      return txt;
}
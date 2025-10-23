/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/libs/axios';
import Cookies from 'js-cookie';
import { ACTIVE_STORE_ID_KEY, STORE_TOKEN_KEY } from '@/core/constants';

export interface CashierCreatePayload {
  firstName: string;
  lastName: string;
  storeId: string;
  email?: string;
  phoneNumber?: string;
  active?: boolean;
}

export interface CashierCreateResponse {
  message: string;
  user: any;
  credentials?: { accessCode: string; password: string };
}

const BASE = '/auth/cashiers';

function withStoreHeaders() {
  const bearer = Cookies.get(STORE_TOKEN_KEY);
  const sid = Cookies.get(ACTIVE_STORE_ID_KEY);
  const headers: Record<string, string> = { 'x-app-id': 'merchant' };
  if (bearer) headers['Authorization'] = `Bearer ${bearer}`;
  if (sid) headers['x-store-id'] = sid;
  return headers;
}

export async function createCashier(payload: CashierCreatePayload): Promise<CashierCreateResponse> {
  const { data } = await api.post<CashierCreateResponse>(BASE, payload, {
    withCredentials: true,
    headers: withStoreHeaders(),
  });
  return data;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/services/activation.service.ts

import { apiSweepstouch } from "@/api/axios";

export interface ActivationRequestPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  zipcode?: string;
  role?: string;      // default 'promotor'
  avatarUrl?: string; // url de la foto
}

export type ActivationResult =
  | { ok: true; requestId: string; userId: string; raw: any }
  | { ok: false; status: 409; code: 'pending' | 'active_user'; requestId?: string; raw: any };

export async function createActivationRequestFE(
  payload: ActivationRequestPayload
): Promise<ActivationResult> {
  try {
    const { data } = await apiSweepstouch.post('/promoter/activation/activation-requests', {
      ...payload,
      role: payload.role ?? 'promotor',
    });
    // backend devuelve: { success, message, data: { requestId, userId } }
    return { ok: true, requestId: data?.data?.requestId, userId: data?.data?.userId, raw: data };
  } catch (err: any) {
    const status = err?.response?.status;
    const body = err?.response?.data;
    if (status === 409) {
      const msg: string = (body?.error || '').toLowerCase();
      if (msg.includes('pendiente')) {
        // "Ya existe una solicitud de activación pendiente..."
        return { ok: false, status: 409, code: 'pending', requestId: body?.requestId, raw: body };
      }
      if (msg.includes('usuario activo')) {
        // "Ya existe un usuario activo con ese email"
        return { ok: false, status: 409, code: 'active_user', raw: body };
      }
      return { ok: false, status: 409, code: 'pending', raw: body };
    }
    throw err;
  }
}

'use client';

import React from 'react';

/**
 * Sincroniza el token de autenticación entre localStorage y cookies
 * Esto es necesario para que el middleware de Next.js pueda acceder al token
 */
export const syncAuthWithCookies = () => {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('auth_token');
  
  if (token) {
    // Establecer cookie con el token
    document.cookie = `auth_token=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
  } else {
    // Limpiar cookie si no hay token
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

/**
 * Limpia tanto localStorage como cookies
 */
export const clearAuthData = () => {
  if (typeof window === 'undefined') return;

  // Limpiar localStorage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  
  // Limpiar cookie
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

/**
 * Hook para sincronizar automáticamente la autenticación
 */
export const useAuthSync = () => {
  React.useEffect(() => {
    // Sincronizar al cargar
    syncAuthWithCookies();
    
    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        syncAuthWithCookies();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
};


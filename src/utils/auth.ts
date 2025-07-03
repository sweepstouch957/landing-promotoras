import { verifyPassword, generateSessionToken, verifySessionToken } from './encryption';
import credentials from '../data/credentials.json';

export interface User {
  username: string;
  role: string;
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

/**
 * Autentica un usuario con sus credenciales
 * @param loginData - Credenciales de login
 * @returns Datos del usuario autenticado y token de sesión
 */
export const authenticateUser = async (loginData: LoginCredentials): Promise<{ user: User; token: string } | null> => {
  const { username, password } = loginData;
  
  // Buscar usuario en las credenciales
  const userCredentials = Object.values(credentials).find(
    cred => cred.username === username
  );
  
  if (!userCredentials) {
    return null;
  }
  
  // Verificar contraseña
  const isPasswordValid = await verifyPassword(password, userCredentials.password);
  
  if (!isPasswordValid) {
    return null;
  }
  
  // Generar token de sesión
  const token = generateSessionToken(username);
  
  // Retornar datos del usuario (sin la contraseña)
  const user: User = {
    username: userCredentials.username,
    role: userCredentials.role,
    email: userCredentials.email
  };
  
  return { user, token };
};

/**
 * Verifica si hay una sesión válida almacenada
 * @returns Estado de autenticación
 */
export const checkStoredSession = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, token: null };
  }
  
  const token = localStorage.getItem('auth_token');
  
  if (!token || !verifySessionToken(token)) {
    // Limpiar token inválido
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return { isAuthenticated: false, user: null, token: null };
  }
  
  const userString = localStorage.getItem('auth_user');
  if (!userString) {
    return { isAuthenticated: false, user: null, token: null };
  }
  
  try {
    const user: User = JSON.parse(userString);
    return { isAuthenticated: true, user, token };
  } catch {
    // Limpiar datos corruptos
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return { isAuthenticated: false, user: null, token: null };
  }
};

/**
 * Almacena la sesión en localStorage
 * @param user - Datos del usuario
 * @param token - Token de sesión
 */
export const storeSession = (user: User, token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
};

/**
 * Limpia la sesión almacenada
 */
export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
};

/**
 * Verifica si el usuario tiene permisos para acceder a una ruta
 * @param userRole - Rol del usuario
 * @param requiredRole - Rol requerido para la ruta
 * @returns true si tiene permisos
 */
export const hasPermission = (userRole: string, requiredRole: string = 'administrator'): boolean => {
  return userRole === requiredRole;
};

/**
 * Lista de rutas protegidas que requieren autenticación
 */
export const PROTECTED_ROUTES = ['/admin', '/citas'];

/**
 * Verifica si una ruta requiere autenticación
 * @param pathname - Ruta a verificar
 * @returns true si la ruta está protegida
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
};


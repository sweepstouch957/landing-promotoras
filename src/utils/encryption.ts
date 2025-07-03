import bcrypt from 'bcryptjs';

/**
 * Genera un hash de la contraseña usando bcrypt
 * @param password - Contraseña en texto plano
 * @returns Hash de la contraseña
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verifica si una contraseña coincide con su hash
 * @param password - Contraseña en texto plano
 * @param hash - Hash almacenado
 * @returns true si la contraseña es correcta
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Genera un token de sesión simple
 * @param username - Nombre de usuario
 * @returns Token de sesión
 */
export const generateSessionToken = (username: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2);
  return btoa(`${username}:${timestamp}:${randomString}`);
};

/**
 * Verifica si un token de sesión es válido
 * @param token - Token a verificar
 * @param maxAge - Edad máxima del token en milisegundos (default: 24 horas)
 * @returns true si el token es válido
 */
export const verifySessionToken = (token: string, maxAge: number = 24 * 60 * 60 * 1000): boolean => {
  try {
    const decoded = atob(token);
    const [username, timestamp] = decoded.split(':');
    
    if (!username || !timestamp) {
      return false;
    }
    
    const tokenAge = Date.now() - parseInt(timestamp);
    return tokenAge < maxAge;
  } catch {
    return false;
  }
};

/**
 * Extrae el nombre de usuario de un token de sesión
 * @param token - Token de sesión
 * @returns Nombre de usuario o null si el token es inválido
 */
export const getUsernameFromToken = (token: string): string | null => {
  try {
    const decoded = atob(token);
    const [username] = decoded.split(':');
    return username || null;
  } catch {
    return null;
  }
};


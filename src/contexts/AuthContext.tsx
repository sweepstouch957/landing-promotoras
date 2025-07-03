'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, LoginCredentials, authenticateUser, checkStoredSession, storeSession } from '../utils/auth';
import { syncAuthWithCookies, clearAuthData } from '../utils/cookieSync';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });
  const [loading, setLoading] = useState(true);

  // Verificar sesión almacenada al cargar
  useEffect(() => {
    const storedSession = checkStoredSession();
    setAuthState(storedSession);
    
    // Sincronizar con cookies si hay sesión válida
    if (storedSession.isAuthenticated) {
      syncAuthWithCookies();
    }
    
    setLoading(false);
  }, []);

  /**
   * Función de login
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await authenticateUser(credentials);
      
      if (result) {
        const { user, token } = result;
        
        // Actualizar estado
        setAuthState({
          isAuthenticated: true,
          user,
          token
        });
        
        // Almacenar sesión
        storeSession(user, token);
        
        // Sincronizar con cookies para el middleware
        syncAuthWithCookies();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error durante el login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función de logout
   */
  const logout = (): void => {
    // Limpiar estado
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
    
    // Limpiar almacenamiento y cookies
    clearAuthData();
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

/**
 * Hook para verificar si el usuario está autenticado
 */
export const useRequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();
  
  return { isAuthenticated, loading };
};


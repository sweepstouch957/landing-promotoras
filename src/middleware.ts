import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/admin', '/citas'];

/**
 * Verifica si una ruta está protegida
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verifica si hay un token de sesión válido
 */
function hasValidSession(request: NextRequest): boolean {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return false;
  }
  
  try {
    // Decodificar el token para verificar su validez
    const decoded = atob(token);
    const [username, timestamp] = decoded.split(':');
    
    if (!username || !timestamp) {
      return false;
    }
    
    // Verificar que el token no haya expirado (24 horas)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    
    return tokenAge < maxAge;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Si es una ruta protegida
  if (isProtectedRoute(pathname)) {
    // Verificar si hay una sesión válida
    if (!hasValidSession(request)) {
      // Redireccionar al login con la URL de retorno
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      
      // Limpiar cookies de autenticación inválidas
      response.cookies.delete('auth_token');
      
      return response;
    }
  }
  
  // Si está en la página de login y ya está autenticado, redireccionar al admin
  if (pathname === '/login' && hasValidSession(request)) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/admin';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  // Continuar con la solicitud normal
  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto:
     * - api (rutas de API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - archivos públicos con extensiones comunes
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


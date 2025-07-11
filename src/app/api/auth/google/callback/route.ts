import { NextRequest, NextResponse } from 'next/server';
import { googleAuthManager } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/google-auth?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/google-auth?error=no_code', request.url)
      );
    }

    // Intercambiar código por tokens
    const tokens = await googleAuthManager.getTokens(code);

    // Guardar tokens en localStorage del lado del cliente
    // Para esto, redirigimos a la página de Google Auth que maneje el almacenamiento
    const tokensParam = encodeURIComponent(JSON.stringify(tokens));
    
    return NextResponse.redirect(
      new URL(`/admin/google-auth?tokens=${tokensParam}`, request.url)
    );
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL(`/admin/google-auth?error=${encodeURIComponent('oauth_failed')}`, request.url)
    );
  }
}


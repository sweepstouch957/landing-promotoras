import { NextRequest, NextResponse } from 'next/server';
import { googleAuthManager } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin?error=no_code', request.url)
      );
    }

    // Intercambiar código por tokens
    const tokens = await googleAuthManager.getTokens(code);

    // Guardar tokens en localStorage del lado del cliente
    // Para esto, redirigimos a una página que maneje el almacenamiento
    const tokensParam = encodeURIComponent(JSON.stringify(tokens));
    
    return NextResponse.redirect(
      new URL(`/admin?tokens=${tokensParam}`, request.url)
    );
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL(`/admin?error=${encodeURIComponent('oauth_failed')}`, request.url)
    );
  }
}


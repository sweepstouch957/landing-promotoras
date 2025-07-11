import { google } from 'googleapis';

export interface GoogleCredentials {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export class GoogleAuthManager {
  private oauth2Client: InstanceType<typeof google.auth.OAuth2>;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    console.log('DEBUG: GOOGLE_CLIENT_ID:', clientId);
    console.log(
      'DEBUG: GOOGLE_CLIENT_SECRET:',
      clientSecret ? '*****' : 'UNDEFINED'
    ); // No imprimir el secreto completo
    console.log('DEBUG: GOOGLE_REDIRECT_URI:', redirectUri);

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('ERROR: Missing Google OAuth environment variables!');
      // Podrías lanzar un error aquí o manejarlo de otra forma si prefieres
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  // Generar URL de autorización
  generateAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.send',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  // Intercambiar código por tokens
  async getTokens(code: string): Promise<GoogleCredentials> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens as GoogleCredentials;
  }

  // Configurar credenciales
  setCredentials(credentials: GoogleCredentials) {
    this.oauth2Client.setCredentials(credentials);
  }

  // Refrescar token de acceso (recibe todo credentials)
  async refreshAccessToken(
    credentials: GoogleCredentials
  ): Promise<GoogleCredentials> {
    this.oauth2Client.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      token_type: credentials.token_type,
      expiry_date: credentials.expiry_date,
    });



    // Nota: refreshAccessToken() está deprecated en googleapis v39+,
    // se recomienda usar getAccessToken(), pero mantengo así para compatibilidad.
    const { credentials: refreshed } =
      await this.oauth2Client.refreshAccessToken();

    return refreshed as GoogleCredentials;
  }

  // Obtener cliente autenticado
  getAuthenticatedClient() {
    return this.oauth2Client;
  }

  // Verificar si el token es válido
  isTokenValid(credentials: GoogleCredentials): boolean {
    return credentials.expiry_date > Date.now();
  }
}

// Instancia singleton
export const googleAuthManager = new GoogleAuthManager();

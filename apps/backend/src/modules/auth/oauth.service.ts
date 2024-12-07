import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OAuthService {
  async refreshGoogleToken(refreshToken: string): Promise<string> {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      null,
      {
        params: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
      },
    );

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    }

    throw new UnauthorizedException('Failed to refresh Google access token');
  }

  /*async refreshFacebookToken(refreshToken: string): Promise<string> {
    // Implementa la lógica para renovar el token de Facebook si es necesario
    // Nota: Facebook no usa un refresh token de la misma manera que Google.
    // Puedes necesitar manejar esto de manera diferente.
    throw new UnauthorizedException('Facebook token refresh not implemented');
  }*/
}

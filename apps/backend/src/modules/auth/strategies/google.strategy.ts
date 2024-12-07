// src/auth/strategies/google.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { OAuthDto } from '../dto/oauth.dto';
import { AuthenticatedUser } from '../../../types/authenticated-user.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<AuthenticatedUser> {
    if (!profile || !profile.emails || !profile.emails.length) {
      throw new UnauthorizedException('Invalid Google profile');
    }

    const oauthDto: OAuthDto = {
      provider: 'google',
      accessToken,
      refreshToken,
      profile,
    };

    // Delegate to AuthService for user handling and token generation
    const user = await this.authService.oauthLogin(oauthDto);

    // Ensure the returned user aligns with the expected type
    if (!user.access_token || !user.refresh_token) {
      throw new UnauthorizedException('Authentication failed');
    }

    return user; // Must match AuthenticatedUser interface
  }
}

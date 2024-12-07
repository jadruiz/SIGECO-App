// src/auth/strategies/facebook.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { AuthService } from '../auth.service';
import { OAuthDto } from '../dto/oauth.dto';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
      profileFields: ['id', 'emails', 'name', 'photos'], 
    });
  }

  async validate(accessToken: string, profile: Profile) {
    const oauthDto: OAuthDto = {
      provider: 'facebook',
      accessToken,
      profile,
    };

    return this.authService.oauthLogin(oauthDto);
  }
}

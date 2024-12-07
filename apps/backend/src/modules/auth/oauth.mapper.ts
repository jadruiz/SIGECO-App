// src/auth/oauth.mapper.ts
import { Injectable } from '@nestjs/common';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as FacebookProfile } from 'passport-facebook';
import { CreateUserDto } from '../users/dto/create-user.dto';

type Profile = GoogleProfile | FacebookProfile;

@Injectable()
export class OAuthMapper {
  mapProfileToUserDto(profile: Profile, provider: string): CreateUserDto {
    if (!profile || !profile._json) {
      throw new Error('Profile is undefined or missing _json property');
    }

    const profileJson = profile._json;

    switch (provider) {
      case 'google':
        return this.mapGoogleResponse(profileJson);
      case 'facebook':
        return this.mapFacebookResponse(profileJson);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private mapGoogleResponse(profileJson: any): CreateUserDto {
    return {
      username:
        profileJson.name ||
        `${profileJson.given_name} ${profileJson.family_name}`,
      email: profileJson.email || 'default@example.com',
      password: this.generateRandomPassword(),
      firstname: profileJson.given_name || '',
      lastname: profileJson.family_name || '',
      photo: profileJson.picture || '',
    };
  }

  private mapFacebookResponse(profileJson: any): CreateUserDto {
    return {
      username: profileJson.name || 'default_username',
      email: profileJson.email || 'default@example.com',
      password: this.generateRandomPassword(),
      firstname: profileJson.first_name || '',
      lastname: profileJson.last_name || '',
      photo: profileJson.picture?.data?.url || '',
    };
  }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8);
  }
}

import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SharedService } from '../../core/shared/shared.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserDto } from '../users/dto/user.dto';
import { IAuthService } from '../../core/interfaces/auth-service.interface';
import { OAuthMapper } from './oauth.mapper';
import { LoginDto } from './dto/login.dto';
import { OAuthDto } from './dto/oauth.dto';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as FacebookProfile } from 'passport-facebook';

type Profile = GoogleProfile | FacebookProfile;

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sharedService: SharedService,
    private readonly oauthMapper: OAuthMapper,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserDto | null> {
    const user = await this.usersService.findOne(username);
    if (!user) return null;

    const isPasswordValid = await this.sharedService.validatePassword(
      password,
      user.password,
    );
    return isPasswordValid ? user : null;
  }

  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(
      credentials.username,
      credentials.password,
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  async oauthLogin(oauthData: OAuthDto): Promise<AuthResponseDto> {
    const { provider, profile, accessToken, refreshToken } = oauthData;

    if (!profile) {
      throw new UnauthorizedException('Profile data is missing or incomplete');
    }

    // Adapta el perfil al tipo esperado
    const adaptedProfile = this.adaptToProfile(profile, provider);

    // Mapear el perfil adaptado a un CreateUserDto
    const userDto = this.oauthMapper.mapProfileToUserDto(adaptedProfile, provider);

    let user = await this.usersService.findOneByEmail(userDto.email);

    if (!user) {
      user = await this.usersService.createOAuthUser(userDto);
    }

    await this.usersService.updateOAuthTokens(
      user.id,
      provider,
      adaptedProfile.id,
      accessToken,
      refreshToken,
    );

    return this.generateTokens(user);
  }

  private adaptToProfile(rawProfile: any, provider: string): Profile {
    if (provider === 'google') {
      return {
        id: rawProfile.id,
        displayName: rawProfile.displayName || rawProfile.name,
        emails: rawProfile.emails || [],
        photos: rawProfile.photos || [],
        provider: 'google',
        _raw: JSON.stringify(rawProfile),
        _json: rawProfile,
      } as GoogleProfile;
    } else if (provider === 'facebook') {
      return {
        id: rawProfile.id,
        displayName: rawProfile.displayName || rawProfile.name,
        emails: rawProfile.emails || [],
        photos: rawProfile.photos || [],
        provider: 'facebook',
        _raw: JSON.stringify(rawProfile),
        _json: rawProfile,
      } as FacebookProfile;
    } else {
      throw new UnauthorizedException(`Unsupported provider: ${provider}`);
    }
  }

  private async generateTokens(user: UserDto): Promise<AuthResponseDto> {
    const tokens = await this.sharedService.generateToken(user);
    return { ...tokens, user };
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    const { username, sub } = await this.sharedService.verifyToken(token);
    const access_token = this.jwtService.sign(
      { username, sub },
      { expiresIn: this.configService.get<string>('jwt.accessTokenExpiresIn') },
    );
    return { access_token };
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      await this.sharedService.blacklistToken(token);
      return { message: 'Logged out successfully' };
    } catch {
      throw new InternalServerErrorException('An error occurred during logout');
    }
  }
}

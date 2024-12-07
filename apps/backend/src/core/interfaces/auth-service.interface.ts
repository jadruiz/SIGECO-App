// src/interfaces/auth-service.interface.ts
import { AuthResponseDto } from '../../modules/auth/dto/auth-response.dto';
import { UserDto } from '../../modules/users/dto/user.dto';
import { LoginDto } from '../../modules/auth/dto/login.dto';
import { OAuthDto } from '../../modules/auth/dto/oauth.dto';

export interface IAuthService {
  validateUser(username: string, password: string): Promise<UserDto | null>;
  login(credentials: LoginDto): Promise<AuthResponseDto>;
  oauthLogin(oauthData: OAuthDto): Promise<AuthResponseDto>;
  refreshToken(token: string): Promise<{ access_token: string }>;
  logout(token: string): Promise<{ message: string }>;
}

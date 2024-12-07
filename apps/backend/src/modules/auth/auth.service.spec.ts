import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SharedService } from '../../core/shared/shared.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { OAuthMapper } from './oauth.mapper';
import { UserDto } from '../users/dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthDto } from './dto/oauth.dto';
import { Redis } from 'ioredis';

// Mocks
const mockUsersService = () => ({
  findOne: jest.fn(),
  findOneByEmail: jest.fn(),
  createOAuthUser: jest.fn(),
  updateOAuthTokens: jest.fn(),
});

const mockSharedService = () => ({
  validatePassword: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  blacklistToken: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

const mockOAuthService = () => ({
  refreshGoogleToken: jest.fn(),
});

const mockRedis = () => ({
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
});

const mockConfigService = () => ({
  get: jest.fn((key: string) => {
    const config: Record<string, any> = {
      'jwt.accessTokenExpiresIn': '1h',
      'jwt.refreshTokenExpiresIn': '7d',
      'bcrypt.saltRounds': 10,
    };
    return config[key];
  }),
});

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let sharedService: jest.Mocked<SharedService>;
  let jwtService: jest.Mocked<JwtService>;
  let oauthService: jest.Mocked<OAuthService>;
  let configService: jest.Mocked<ConfigService>;
  let oauthMapper: OAuthMapper;
  let redis: jest.Mocked<Redis>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService() },
        { provide: SharedService, useValue: mockSharedService() },
        { provide: JwtService, useValue: mockJwtService() },
        { provide: OAuthService, useValue: mockOAuthService() },
        { provide: ConfigService, useValue: mockConfigService() },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: mockRedis(),
        },
        OAuthMapper,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    sharedService = module.get(SharedService);
    jwtService = module.get(JwtService);
    oauthService = module.get(OAuthService);
    configService = module.get(ConfigService);
    oauthMapper = module.get(OAuthMapper);
    redis = module.get('default_IORedisModuleConnectionToken');
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return null if user is not found', async () => {
      usersService.findOne.mockResolvedValue(undefined);
      const result = await authService.validateUser('username', 'password');
      expect(result).toBeNull();
    });

    it('should return user if password is valid', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        password: 'hashedPassword',
      };

      usersService.findOne.mockResolvedValue(user as any);
      sharedService.validatePassword.mockResolvedValue(true);

      const result = await authService.validateUser('username', 'password');
      expect(result).toEqual(user as unknown as UserDto);
    });

    it('should return null if password is invalid', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        password: 'hashedPassword',
      };

      usersService.findOne.mockResolvedValue(user as any);
      sharedService.validatePassword.mockResolvedValue(false);

      const result = await authService.validateUser('username', 'password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if credentials are invalid', async () => {
      authService.validateUser = jest.fn().mockResolvedValue(null);
      const credentials: LoginDto = {
        username: 'username',
        password: 'password',
      };

      await expect(authService.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return tokens if credentials are valid', async () => {
      const user: UserDto = {
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        photo: '',
      };

      authService.validateUser = jest.fn().mockResolvedValue(user as any);
      sharedService.generateToken.mockResolvedValue({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });

      const credentials: LoginDto = {
        username: 'username',
        password: 'password',
      };
      const result = await authService.login(credentials);

      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user,
      });
    });
  });

  describe('oauthLogin', () => {
    it('should map profile and create a new user if not found', async () => {
      const oauthData: OAuthDto = {
        provider: 'google',
        profile: { id: 'google-id', _json: { email: 'test@test.com' } } as any,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      oauthMapper.mapGoogleResponseToUserDto = jest.fn().mockReturnValue({
        email: 'test@test.com',
        username: 'testuser',
      } as any);
      usersService.findOneByEmail.mockResolvedValue(undefined);
      usersService.createOAuthUser.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        username: 'testuser',
      } as any);
      usersService.updateOAuthTokens.mockResolvedValue(undefined);

      sharedService.generateToken.mockResolvedValue({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });

      const result = await authService.oauthLogin(oauthData);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
    });
  });

  describe('refreshToken', () => {
    it('should refresh and return the access token', async () => {
      const token = 'refresh-token';
      sharedService.verifyToken.mockResolvedValue({ username: 'user', sub: 1 });
      jwtService.sign.mockReturnValue('new-access-token');

      const result = await authService.refreshToken(token);
      expect(result).toEqual({ access_token: 'new-access-token' });
    });
  });

  describe('logout', () => {
    it('should blacklist the token and return success message', async () => {
      const token = 'valid-token';
      sharedService.blacklistToken.mockResolvedValue();

      const result = await authService.logout(token);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should throw InternalServerErrorException if blacklisting fails', async () => {
      const token = 'valid-token';
      sharedService.blacklistToken.mockRejectedValue(
        new Error('Failed to blacklist'),
      );

      await expect(authService.logout(token)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});

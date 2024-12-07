import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { IAuthService } from '../../core/interfaces/auth-service.interface';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthDto } from './dto/oauth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  ThrottlerModule,
  ThrottlerGuard,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MetricsService } from '../metrics/metrics.service';
import { SharedService } from '../../core/shared/shared.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: IAuthService;

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        photo: '',
        level: 0,
        coins: 0,
        experience: 0,
      },
    }),
    oauthLogin: jest.fn().mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: {
        id: 1,
        username: 'oauthuser',
        email: 'oauth@test.com',
        photo: '',
        level: 0,
        coins: 0,
        experience: 0,
      },
    }),
    refreshToken: jest
      .fn()
      .mockResolvedValue({ access_token: 'new-access-token' }),
    logout: jest.fn().mockResolvedValue({ message: 'Logged out successfully' }),
  };

  const mockMetricsService = {
    authRequestsCounter: { inc: jest.fn() },
    loginFailuresCounter: { inc: jest.fn() },
    refreshFailuresCounter: { inc: jest.fn() },
    logoutCounter: { inc: jest.fn() },
  };

  const mockSharedService = {
    validateToken: jest.fn(),
    generateToken: jest.fn().mockResolvedValue({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    }),
    blacklistToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (
            configService: ConfigService,
          ): ThrottlerModuleOptions => ({
            throttlers: [
              {
                ttl: configService.get<number>('throttler.ttl') || 60,
                limit: configService.get<number>('throttler.limit') || 10,
              },
            ],
          }),
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: 'IAuthService',
          useValue: mockAuthService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
        {
          provide: SharedService,
          useValue: mockSharedService,
        },
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
        JwtService,
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<IAuthService>('IAuthService');
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should login a user', async () => {
    const credentials: LoginDto = {
      username: 'testuser',
      password: 'testpassword',
    };
    const req = { query: {} } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await authController.login(credentials, req, res);

    expect(authService.login).toHaveBeenCalledWith(credentials);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        photo: '',
        level: 0,
        coins: 0,
        experience: 0,
      },
    });
  });

  it('should handle OAuth login', async () => {
    const oauthData: OAuthDto = {
      provider: 'google',
      accessToken: 'oauth-token',
      profile: {} as any,
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await authController.oauthLogin(oauthData, res);

    expect(authService.oauthLogin).toHaveBeenCalledWith(oauthData);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: {
        id: 1,
        username: 'oauthuser',
        email: 'oauth@test.com',
        photo: '',
        level: 0,
        coins: 0,
        experience: 0,
      },
    });
  });

  it('should refresh a token', async () => {
    const refreshTokenDto: RefreshTokenDto = { token: 'refresh-token' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await authController.refreshToken(refreshTokenDto, res);

    expect(authService.refreshToken).toHaveBeenCalledWith(
      refreshTokenDto.token,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ access_token: 'new-access-token' });
  });

  it('should logout a user', async () => {
    const req = { headers: { authorization: 'Bearer access-token' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await authController.logout(req, res);

    expect(authService.logout).toHaveBeenCalledWith('access-token');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logged out successfully',
    });
  });
});

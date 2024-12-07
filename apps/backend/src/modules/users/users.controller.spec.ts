import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { IUserService } from '../../core/interfaces/user-service.interface';
import { MetricsService } from '../metrics/metrics.service';
import {
  ThrottlerModule,
  ThrottlerGuard,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from '../../core/guards/custom-throttler.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SharedService } from '../../core/shared/shared.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: IUserService;

  const mockUserService = {
    createUser: jest.fn(),
    findById: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockMetricsService = {
    incrementUserRequests: jest.fn(),
    incrementUserCreation: jest.fn(),
    incrementUserFindById: jest.fn(),
  };

  const mockSharedService = {
    hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
    validatePassword: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
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
      controllers: [UsersController],
      providers: [
        {
          provide: 'IUserService',
          useValue: mockUserService,
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
          useClass: CustomThrottlerGuard,
        },
        JwtAuthGuard,
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<IUserService>('IUserService');
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return user info', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'Test1234!',
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockUserService.createUser.mockResolvedValue({ id: 1, ...createUserDto });

      await usersController.register(createUserDto, res as any);

      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, ...createUserDto });
    });
  });

  describe('findById', () => {
    it('should return user info by ID', async () => {
      const userId = 1;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockUserService.findById.mockResolvedValue({
        id: userId,
        username: 'testuser',
      });

      await usersController.findById(userId, res as any);

      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: userId,
        username: 'testuser',
      });
    });
  });

  describe('changePassword', () => {
    it('should change the user password successfully', async () => {
      const changePasswordDto = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        newPasswordConfirm: 'NewPass123!',
      };
      const user = { userId: 1 };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await usersController.changePassword(changePasswordDto, user, res as any);

      expect(usersService.changePassword).toHaveBeenCalledWith(
        user.userId,
        changePasswordDto,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password changed successfully',
      });
    });
  });
});

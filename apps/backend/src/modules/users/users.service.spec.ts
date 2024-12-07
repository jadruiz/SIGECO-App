import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { OAuthProvider } from './entities/oauth-provider.entity';
import { SharedService } from '../../core/shared/shared.service';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

// Mock explícito del UserRepository
const mockUserRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

// Mock explícito del OAuthProviderRepository
const mockOAuthProviderRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

// Mock explícito del SharedService
const mockSharedService = () => ({
  hashPassword: jest.fn(),
  validatePassword: jest.fn(),
});

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;
  let oauthProviderRepository: jest.Mocked<Repository<OAuthProvider>>;
  let sharedService: jest.Mocked<SharedService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository() },
        {
          provide: getRepositoryToken(OAuthProvider),
          useValue: mockOAuthProviderRepository(),
        },
        { provide: SharedService, useValue: mockSharedService() },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<jest.Mocked<Repository<User>>>(
      getRepositoryToken(User),
    );
    oauthProviderRepository = module.get<
      jest.Mocked<Repository<OAuthProvider>>
    >(getRepositoryToken(OAuthProvider));
    sharedService = module.get<jest.Mocked<SharedService>>(SharedService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('changePassword', () => {
    it('should throw UnauthorizedException if current password is incorrect', async () => {
      const user = new User();
      user.password = 'hashedPassword';
      userRepository.findOne.mockResolvedValueOnce(user);
      sharedService.validatePassword.mockResolvedValueOnce(false);

      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'New@1234',
        newPasswordConfirm: 'New@1234',
      };

      await expect(
        usersService.changePassword(1, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should change password successfully', async () => {
      const user = new User();
      user.password = 'hashedPassword';
      userRepository.findOne.mockResolvedValueOnce(user);
      sharedService.validatePassword.mockResolvedValueOnce(true);
      sharedService.hashPassword.mockResolvedValueOnce('newHashedPassword');

      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'Correct@1234',
        newPassword: 'New@1234',
        newPasswordConfirm: 'New@1234',
      };

      await usersService.changePassword(1, changePasswordDto);

      expect(sharedService.validatePassword).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        'hashedPassword',
      );
      expect(sharedService.hashPassword).toHaveBeenCalledWith(
        changePasswordDto.newPassword,
      );
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(user.password).toBe('newHashedPassword');
    });
  });
});

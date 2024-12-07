import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { OAuthProvider } from './entities/oauth-provider.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SharedService } from '../../core/shared/shared.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(OAuthProvider)
    private readonly oauthProviderRepository: Repository<OAuthProvider>,
    private readonly sharedService: SharedService,
  ) {}

  // Creación de nuevo usuario
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    // Comprobación de existencia de usuario o email
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash de la contraseña antes de guardar
    const hashedPassword = await this.sharedService.hashPassword(password);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async createOAuthUser(userData: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async updateOAuthTokens(
    userId: number,
    provider: string,
    providerId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    const user = await this.findById(userId);

    let oauthProvider = user.oauthProviders.find(
      (op) => op.provider === provider,
    );

    if (!oauthProvider) {
      oauthProvider = this.oauthProviderRepository.create({
        provider,
        providerId,
        accessToken,
        refreshToken: refreshToken || '', // Garantiza que sea string
        user,
      });
      user.oauthProviders.push(oauthProvider);
    } else {
      oauthProvider.accessToken = accessToken;
      oauthProvider.refreshToken = refreshToken || ''; // Garantiza que sea string
    }

    await this.oauthProviderRepository.save(oauthProvider);
  }

  async findOAuthProvider(
    userId: number,
    provider: string,
  ): Promise<OAuthProvider | undefined> {
    const oauthProvider = await this.oauthProviderRepository.findOne({
      where: {
        user: { id: userId },
        provider,
      },
    });
    return oauthProvider || undefined; // Convertir null en undefined
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user || undefined; // Convertir null en undefined
  }

  // Encontrar usuario por nombre de usuario
  async findOne(username: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return user || undefined; // Convertir null en undefined
  }

  // Encontrar usuario por ID
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['oauthProviders'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Cambio de contraseña
  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword, newPasswordConfirm } =
      changePasswordDto;

    if (newPassword !== newPasswordConfirm) {
      throw new ConflictException('New passwords do not match');
    }
    // Encontrar usuario por ID
    const user = await this.findById(userId);
    const isPasswordValid = await this.sharedService.validatePassword(
      currentPassword.trim(),
      user.password.trim(),
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    // Hash de la nueva contraseña y guardado
    const hashedNewPassword =
      await this.sharedService.hashPassword(newPassword);
    user.password = hashedNewPassword;
    await this.usersRepository.save(user);
  }
}

import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { UserDto } from '../../modules/users/dto/user.dto';

@Injectable()
export class SharedService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // Hash de contraseñas
  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.getSaltRounds();
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  // Validación de contraseñas
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password.trim(), hash.trim());
  }

  // Generación de tokens
  async generateToken(
    user: UserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.signToken(payload, 'jwt.accessTokenExpiresIn'),
      refresh_token: this.signToken(payload, 'jwt.refreshTokenExpiresIn'),
    };
  }

  // Verificación de token
  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Añadir token a la lista negra
  async blacklistToken(token: string): Promise<void> {
    const expiresIn = this.getJwtExpirationTime('jwt.accessTokenExpiresIn');
    await this.redis.set(`blacklist:${token}`, 'true', 'EX', expiresIn);
  }

  // Verificar si el token está en la lista negra
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${token}`);
    return result === 'true';
  }

  // Métodos privados de ayuda
  private getSaltRounds(): number {
    return this.configService.get<number>('bcrypt.saltRounds') || 10;
  }

  private signToken(payload: object, expiresInConfig: string): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(expiresInConfig),
    });
  }

  private getJwtExpirationTime(configKey: string): number {
    const expiresIn = this.configService.get<number>(configKey);
    if (!expiresIn) {
      throw new InternalServerErrorException(
        'Token expiration time is not configured correctly.',
      );
    }
    return expiresIn;
  }
}

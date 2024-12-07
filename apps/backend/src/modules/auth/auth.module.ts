// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
//import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '../users/users.module';
import { OAuthMapper } from './oauth.mapper';
import { SharedModule } from '../../core/shared/shared.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MetricsService } from '../metrics/metrics.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessTokenExpiresIn'),
        },
      }),
    }),
    UsersModule,
    SharedModule,
  ],
  providers: [
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
    AuthService,
    OAuthService,
    JwtStrategy,
    /*FacebookStrategy,*/
    GoogleStrategy,
    MetricsService,
    JwtAuthGuard,
    OAuthMapper,
  ],
  controllers: [AuthController],
  exports: ['IAuthService', JwtModule, JwtAuthGuard],
})
export class AuthModule {}

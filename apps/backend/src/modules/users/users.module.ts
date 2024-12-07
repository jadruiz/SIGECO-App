import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { OAuthProvider } from './entities/oauth-provider.entity';
import { UserRepository } from './user.repository';
import { SharedModule } from '../../core/shared/shared.module';
import { MetricsService } from '../metrics/metrics.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, OAuthProvider]), SharedModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'IUserService',
      useClass: UsersService,
    },
    UserRepository,
    MetricsService,
  ],
  exports: ['IUserService', UsersService, UserRepository],
})
export class UsersModule {}

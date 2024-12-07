import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: `apps/backend/.env.${process.env.NODE_ENV || 'development'}` });

import { AppDataSource } from '../../config/database/data-source';
import { SharedService } from '../../core/shared/shared.service';
import { UserSeeder } from '../seeders/user.seeder';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source initialized.');

    const configService = new ConfigService(process.env);

    const jwtService = new JwtService({
      secret: configService.get<string>('JWT_SECRET', 'defaultSecret'),
      signOptions: { expiresIn: '1h' },
    });

    const redis = new Redis(configService.get<string>('REDIS_URL', 'redis://localhost:6379'));

    const sharedService = new SharedService(jwtService, configService, redis);

    const userSeeder = new UserSeeder(AppDataSource, sharedService);
    await userSeeder.run();

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error while seeding the database:', error);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

seedDatabase();

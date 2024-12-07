// src/home/home.module.ts
import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { SharedModule } from '../../core/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}

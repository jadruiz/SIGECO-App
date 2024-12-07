// src/users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Inject,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IUserService } from '../../core/interfaces/user-service.interface';
import { Public } from '../../core/decorators/public.decorator';
import { MetricsService } from '../metrics/metrics.service';
import { plainToClass } from 'class-transformer';
import { CustomThrottlerGuard } from '../../core/guards/custom-throttler.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('IUserService') private readonly usersService: IUserService,
    private readonly metricsService: MetricsService,
  ) {}

  // Endpoint para registrar un nuevo usuario
  @UseGuards(CustomThrottlerGuard)
  @Public()
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response> {
    this.metricsService.incrementUserRequests();
    this.metricsService.incrementUserCreation();
    const user = await this.usersService.createUser(createUserDto);
    const userInfo = plainToClass(UserInfoDto, user);
    return res.status(HttpStatus.CREATED).json(userInfo);
  }

  // Endpoint para encontrar un usuario por ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    this.metricsService.incrementUserRequests();
    this.metricsService.incrementUserFindById();
    const user = await this.usersService.findById(id);
    const userInfo = plainToClass(UserInfoDto, user);
    return res.status(HttpStatus.OK).json(userInfo);
  }

  // Endpoint para cambiar la contraseña del usuario autenticado
  @Post('change-password')
  @UseGuards(JwtAuthGuard, CustomThrottlerGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: any,
    @Res() res: Response,
  ): Promise<Response> {
    const userId = user.userId;
    await this.usersService.changePassword(userId, changePasswordDto);

    return res
      .status(HttpStatus.OK)
      .json({ message: 'Password changed successfully' });
  }
}

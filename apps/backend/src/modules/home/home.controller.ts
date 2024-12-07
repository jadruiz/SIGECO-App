import { Controller, Get, Res, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HomeService } from './home.service';
import { ApiResponse } from '@nestjs/swagger';
import { Response, Request } from 'express';

@Controller('home')
@UseGuards(JwtAuthGuard)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'User data retrieved successfully.',
  })
  getHello(@Res() res: Response, @Req() req: Request): void {
    const user = req.user;
    res.status(200).send({
      message: this.homeService.getHello(),
      user: user,
    });
  }
}

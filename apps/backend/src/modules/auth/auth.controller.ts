import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Inject,
  Res,
  Req,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../../core/decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MetricsService } from '../metrics/metrics.service';
import { IAuthService } from '../../core/interfaces/auth-service.interface';
import { LoginDto } from './dto/login.dto';
import { OAuthDto } from './dto/oauth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CustomThrottlerGuard } from '../../core/guards/custom-throttler.guard';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from '../../types/authenticated-user.interface';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    @Inject('IAuthService') private readonly authService: IAuthService,
    private readonly metricsService: MetricsService,
  ) {}

  @Public()
  @Get('csrf-token')
  @ApiOperation({
    summary: 'Get CSRF token',
    description: 'Retrieve a CSRF token for the current session.',
  })
  @ApiResponse({
    status: 200,
    description: 'CSRF token retrieved successfully.',
  })
  getCsrfToken(@Req() req: Request): { csrfToken: string } {
    this.metricsService.authRequestsCounter.inc();
    return { csrfToken: req.csrfToken() };
  }

  @Public()
  @Post('login')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate a user with their username and password.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials.',
    schema: {
      example: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        path: '/auth/login',
      },
    },
  })
  async login(
    @Body() credentials: LoginDto | OAuthDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    this.metricsService.authRequestsCounter.inc();

    try {
      let authResponse: AuthResponseDto;
      if (req.query.provider) {
        authResponse = await this.authService.oauthLogin(
          credentials as OAuthDto,
        );
      } else {
        authResponse = await this.authService.login(credentials as LoginDto);
      }
      return res.status(HttpStatus.OK).json(authResponse);
    } catch (error) {
      this.metricsService.loginFailuresCounter.inc();
      if (error instanceof Error && error.message === 'invalid csrf token') {
        return res.status(HttpStatus.FORBIDDEN).json({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Invalid CSRF token. Please refresh and try again.',
          error: 'Forbidden',
        });
      }
      throw error;
    }
  }

  @Public()
  @Post('oauth/login')
  @UseGuards(CustomThrottlerGuard)
  @ApiOperation({
    summary: 'OAuth login',
    description: 'Authenticate a user via OAuth (Google, Facebook).',
  })
  async oauthLogin(
    @Body() oauthData: OAuthDto,
    @Res() res: Response,
  ): Promise<Response> {
    const authResponse = await this.authService.oauthLogin(oauthData);
    return res.status(HttpStatus.OK).json(authResponse);
  }

  @Public()
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {}

  @Public()
  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const authResponse = await this.authService.oauthLogin({
      provider: 'facebook',
      accessToken: req.query.accessToken as string,
    });
    res.redirect(
      `http://frontend-url.com/auth-success?token=${authResponse.access_token}`,
    );
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(): Promise<any> {}

  @Public()
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    res.redirect(
      `http://frontend-url.com/auth-success?token=${user.access_token}&refresh_token=${user.refresh_token}`,
    );
  }

  @UseGuards(JwtAuthGuard, CustomThrottlerGuard)
  @Post('refresh-token')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refresh token',
    description: 'Refresh the authentication token using a refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully.',
    type: String,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid token.',
    schema: {
      example: {
        message: 'Invalid refresh token',
        error: 'Unauthorized',
        path: '/auth/refresh-token',
      },
    },
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res() res: Response,
  ): Promise<Response> {
    this.metricsService.authRequestsCounter.inc();
    try {
      const newAccessToken = await this.authService.refreshToken(
        refreshTokenDto.token,
      );
      return res.status(HttpStatus.OK).json(newAccessToken);
    } catch (error) {
      this.metricsService.refreshFailuresCounter.inc();
      throw error;
    }
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Log out the authenticated user and invalidate their token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      example: {
        message: 'Internal server error',
        error: 'InternalServerError',
        path: '/auth/logout',
      },
    },
  })
  async logout(@Req() req: Request, @Res() res: Response): Promise<Response> {
    this.metricsService.authRequestsCounter.inc();
    this.metricsService.logoutCounter.inc();

    const authorization = req.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authorization.split(' ')[1];
    try {
      await this.authService.logout(token);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Logged out successfully' });
    } catch (error) {
      throw error;
    }
  }
}

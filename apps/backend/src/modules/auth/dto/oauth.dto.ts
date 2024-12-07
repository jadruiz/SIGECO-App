import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthDto {
  @ApiProperty({ description: 'OAuth provider (e.g., google, facebook)' })
  @IsString()
  @IsNotEmpty({ message: 'Provider is required' })
  provider: string = '';

  @ApiProperty({ description: 'OAuth access token' })
  @IsString()
  @IsNotEmpty({ message: 'Access token is required' })
  accessToken: string = '';

  @ApiProperty({ description: 'OAuth refresh token', required: false })
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @ApiProperty({ description: 'User email address', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'User first name', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'User last name', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'User profile picture URL', required: false })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({
    description: 'Additional user details (custom structure)',
    required: false,
  })
  @IsOptional()
  profile?: {
    [key: string]: any;
  };
}

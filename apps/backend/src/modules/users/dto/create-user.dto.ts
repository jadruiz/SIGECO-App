// src/modules/users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Username of the user' })
  @IsString()
  username: string = '';

  @ApiProperty({ description: 'Email of the user' })
  @IsEmail()
  email: string = '';

  @ApiProperty({ description: 'Password of the user' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[\W_])/, {
    message: 'Password must contain at least one special character',
  })
  password: string = '';

  @ApiProperty({ description: 'First name of the user', required: false })
  @IsString()
  @IsOptional()
  firstname?: string;

  @ApiProperty({ description: 'Last name of the user', required: false })
  @IsString()
  @IsOptional()
  lastname?: string;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  @IsString()
  @IsOptional()
  photo?: string;
}

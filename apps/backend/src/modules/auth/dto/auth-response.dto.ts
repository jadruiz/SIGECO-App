// src/modules/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';

export class AuthResponseDto {
  @ApiProperty()
  access_token: string = '';

  @ApiProperty()
  refresh_token: string = '';

  @ApiProperty({ type: UserDto })
  user: UserDto = new UserDto();
}

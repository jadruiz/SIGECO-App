// src/modules/users/dto/user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  id: number = 0;

  @ApiProperty()
  username: string = '';

  @ApiProperty()
  email: string = '';

  @ApiProperty()
  photo: string = '';
}

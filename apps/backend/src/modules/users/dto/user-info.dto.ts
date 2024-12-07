import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty()
  id: number = 0;

  @ApiProperty()
  username: string = '';

  @ApiProperty()
  email: string = '';

  @ApiProperty()
  photo: string = '';

  @ApiProperty()
  firstname: string = '';

  @ApiProperty()
  lastname: string = '';

  @ApiProperty()
  maternalname: string = '';

  @ApiProperty()
  created_at: Date = new Date();

  @ApiProperty()
  updated_at: Date = new Date();
}

// src/modules/users/dto/change-password.dto.ts
import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string = '';

  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/(?=.*\d)/, {
    message: 'New password must contain at least one number',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'New password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'New password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[\W_])/, {
    message: 'New password must contain at least one special character',
  })
  newPassword: string = '';

  @IsString()
  newPasswordConfirm: string = '';
}

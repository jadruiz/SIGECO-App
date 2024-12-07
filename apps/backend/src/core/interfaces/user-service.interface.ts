// src/interfaces/user-service.interface.ts
import { CreateUserDto } from '../../modules/users/dto/create-user.dto';
import { ChangePasswordDto } from '../../modules/users/dto/change-password.dto';
import { User } from '../../modules/users/entities/user.entity';

export interface IUserService {
  createUser(createUserDto: CreateUserDto): Promise<User>;
  findOne(username: string): Promise<User | undefined>;
  findById(id: number): Promise<User>;
  changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void>;
}

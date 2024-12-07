// src/users/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.repository.findOne({ where: { username } });
    return user || undefined;
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findOneById(id: number): Promise<User | undefined> {
    const user = await this.repository.findOne({ where: { id } });
    return user || undefined;
  }
}

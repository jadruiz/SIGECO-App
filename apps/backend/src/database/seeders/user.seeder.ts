// src/database/seeders/user.seeder.ts
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { SharedService } from '../../core/shared/shared.service';

export class UserSeeder {
  constructor(private dataSource: DataSource, private sharedService: SharedService) {}

  async run() {
    const userRepository = this.dataSource.getRepository(User);

    // Verifica si ya existe un usuario admin
    const existingAdmin = await userRepository.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seed...');
      return;
    }

    // Crear el usuario admin
    const hashedPassword = await this.sharedService.hashPassword('admin123');
    const adminUser = userRepository.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
    });

    await userRepository.save(adminUser);
    console.log('Admin user created successfully.');
  }
}

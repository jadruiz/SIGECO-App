// src/modules/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { OAuthProvider } from './oauth-provider.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ unique: true })
  username: string = '';

  @Column()
  password: string = '';

  @Column({ unique: true })
  email: string = '';

  @Column({ default: 'assets/images/perfil/default_profile_400x400.png' })
  photo: string = '';

  @Column({ nullable: true })
  firstname: string = '';

  @Column({ nullable: true })
  lastname: string = '';

  @Column({ nullable: true })
  maternalname: string = '';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date = new Date();

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date = new Date();

  @OneToMany(() => OAuthProvider, (oauthProvider) => oauthProvider.user)
  oauthProviders!: OAuthProvider[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('oauth_providers')
export class OAuthProvider {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  provider: string = '';

  @Column()
  providerId: string = '';

  @Column()
  accessToken: string = '';

  @Column({ nullable: true })
  refreshToken: string = '';

  // Relación correcta hacia la entidad `User`
  @ManyToOne(() => User, (user) => user.oauthProviders, { onDelete: 'CASCADE' })
  user!: User;
}

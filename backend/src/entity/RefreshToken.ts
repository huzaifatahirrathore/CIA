import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public tokenHash: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  public user: User;

  @Column()
  public expiresAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @Column({ default: false })
  public isRevoked: boolean;
}

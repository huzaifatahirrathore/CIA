import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Length, IsNotEmpty, IsInt, Min, IsNumber } from 'class-validator';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(2, 100)
  name: string;

  @Column('text')
  @IsNotEmpty()
  description: string;

  @Column('int')
  @IsInt()
  @Min(0)
  quantity: number;

  @Column('float')
  @IsNumber()
  price: number;

  @Column()
  @Length(2, 50)
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

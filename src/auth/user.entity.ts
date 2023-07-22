import { MaxLength, MinLength } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @Column()
  @MinLength(40)
  @MaxLength(60)
  password: string;

  @Column()
  isActive: boolean;
}

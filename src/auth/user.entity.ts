import { MaxLength, MinLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from '../tasks/task.entity';

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

  @OneToMany(() => Task, (task) => task.user, { eager: true })
  tasks: Task[];
}

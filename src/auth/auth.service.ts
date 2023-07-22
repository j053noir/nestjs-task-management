import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common/exceptions';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './DTOs/auth-crendential.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
  ) {}

  public async CreateUser(createUserDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = createUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      isActive: true,
    });

    try {
      this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('Username is not available');
      else throw new InternalServerErrorException();
    }
  }
}

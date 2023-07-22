import { Inject, Injectable } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common/exceptions';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { JwtService } from '@nestjs/jwt/dist';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './DTOs/auth-crendential.dto';
import { JwtPayload } from './jwt-payload.interface';
import { JwtResponse } from './jwt-response.interface';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
    private jwtService: JwtService,
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

  public async VerifyUser(
    autheCredentialsDto: AuthCredentialsDto,
  ): Promise<JwtResponse> {
    const { username, password } = autheCredentialsDto;

    if (!username || !password)
      throw new BadRequestException('Please provide a username and password');

    const user = await this.userRepository.findOneBy({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Please validate your credentials');
    }

    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}

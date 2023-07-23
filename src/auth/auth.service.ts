import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common/exceptions';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { JwtService } from '@nestjs/jwt/dist';
import { AuthRepository } from './auth.repository';
import { AuthCredentialsDto } from './DTOs/auth-crendential.dto';
import { JwtPayload } from './jwt-payload.interface';
import { JwtResponse } from './jwt-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  public async CreateUser(createUserDto: AuthCredentialsDto): Promise<void> {
    try {
      this.authRepository.CreateUser(createUserDto);
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

    const isValid = await this.authRepository.VerifyUser(autheCredentialsDto);

    if (!isValid) {
      throw new UnauthorizedException('Please validate your credentials');
    }

    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}

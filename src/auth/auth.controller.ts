import { Body, Controller, Inject, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './DTOs/auth-crendential.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  public signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.CreateUser(authCredentialsDto);
  }
}

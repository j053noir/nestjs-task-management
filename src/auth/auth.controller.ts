import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './DTOs/auth-crendential.dto';
import { JwtResponse } from './jwt-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  public signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.CreateUser(authCredentialsDto);
  }

  @Post('signin')
  public signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<JwtResponse> {
    return this.authService.VerifyUser(authCredentialsDto);
  }
}

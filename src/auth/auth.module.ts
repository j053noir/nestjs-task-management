import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { authProviders } from './auth.provider';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt-strategy';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'secret',
      signOptions: {
        expiresIn: 1800,
      },
    }),
  ],
  providers: [...authProviders, JwtStrategy, AuthService],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}

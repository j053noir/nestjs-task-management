import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { authProviders } from './auth.provider';
import { AuthService } from './auth.service';

@Module({
  imports: [DatabaseModule],
  providers: [...authProviders, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

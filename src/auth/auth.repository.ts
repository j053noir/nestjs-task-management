import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { AuthCredentialsDto } from './DTOs/auth-crendential.dto';
import { User } from './user.entity';

@Injectable()
export class AuthRepository extends Repository<User> {
  constructor(@Inject('DATA_SOURCE') private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  public async CreateUser(createUserDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = createUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({
      username,
      password: hashedPassword,
      isActive: true,
    });

    this.save(user);
  }

  public async VerifyUser(
    autheCredentialsDto: AuthCredentialsDto,
  ): Promise<boolean> {
    const { username, password } = autheCredentialsDto;

    const user = await this.findOneBy({ username });

    return user && (await bcrypt.compare(password, user.password));
  }
}

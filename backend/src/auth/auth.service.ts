import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<Record<string, any>> {
    const user = await this.usersRepository.findOneBy({
      emailAddress: loginDto.emailAddress,
    });

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatch) throw new UnauthorizedException('Invalid Credentials');

    const payload = { sub: user.userId, emailAddress: user.emailAddress };
    const token = await this.jwtService.signAsync(payload);

    const { id, password, ...others } = user;
    return { access_token: token, user: others };
  }

  async signUp(userDto: CreateUserDto): Promise<Record<string, string>> {
    const userExists = await this.usersRepository.findOneBy({
      emailAddress: userDto.emailAddress,
    });

    if (userExists) throw new ConflictException('Email already exists');

    // Hash user password
    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    await this.usersRepository.save({
      ...userDto,
      password: hashedPassword,
    });

    return { message: 'User registered successfully' };
  }

  async addTeamMember(userDto: AddMemberDto): Promise<Record<string, string>> {
    const userExists = await this.usersRepository.findOneBy({
      emailAddress: userDto.emailAddress,
    });

    if (userExists) throw new ConflictException('Email already exists');

    // Check if organizationId exists
    const orgExists = await this.usersRepository.findOneBy({
      organizationId: userDto.organizationId,
    });

    if (!orgExists) {
      throw new ConflictException('Organization Id does not exists');
    }

    // Hash user password
    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    await this.usersRepository.save({
      ...userDto,
      password: hashedPassword,
    });

    return { message: 'User registered successfully' };
  }

  async getAllTeamMember(
    organizationId: string,
  ): Promise<Record<string, any>[]> {
    const organization = await this.usersRepository.findBy({ organizationId });

    return organization.map((item) => {
      const { id, password, ...others } = item;

      return others;
    });
  }
}

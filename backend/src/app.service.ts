import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './schemas/User.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/Login.dto';
import { UserDto } from './dto/User.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<Record<string, string>> {
    const user = await this.userModel.findOne({
      emailAddress: loginDto.emailAddress,
    });

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatch) throw new UnauthorizedException('Invalid Credentials');

    const payload = { sub: user._id, emailAddress: user.emailAddress };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }

  async signUp(userDto: UserDto): Promise<Record<string, string>> {
    const userExists = await this.userModel.findOne({
      emailAddress: userDto.emailAddress,
    });

    if (userExists) throw new ConflictException('Email already exists');

    // Check if organization name exists
    const orgExists = await this.userModel.findOne({
      organization: userDto.organization,
    });

    if (orgExists) {
      throw new ConflictException(
        'Organization already exists. Choose a different name',
      );
    }

    // Hash user password
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    const newUser = new this.userModel({
      ...userDto,
      password: hashedPassword,
    });

    await newUser.save();

    return { message: 'User registered successfully' };
  }

  logout() {}
}

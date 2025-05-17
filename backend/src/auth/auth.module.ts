import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { jwtModule } from 'src/modules.config';

@Module({
  imports: [jwtModule, TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

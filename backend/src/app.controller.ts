import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { UserDto } from './dto/User.dto';
import { LoginDto } from './dto/Login.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('signup')
  signup(@Body() userDto: UserDto) {
    return this.appService.signUp(userDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.appService.login(loginDto);
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Get()
  // findAll() {}

  // @Get(':id')
  // findOne(@Param('id') id: string) {}

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {}

  // @Delete(':id')
  // remove(@Param('id') id: string) {}

  @Post('signup')
  signup(@Body() userDto: CreateUserDto) {
    return this.authService.signUp(userDto);
  }

  @Post('team/add')
  addTeamMember(@Body() userDto: AddMemberDto) {
    return this.authService.addTeamMember(userDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}

import { IsString, IsEmail, Length, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from 'src/enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @Length(2, 50)
  firstName: string;

  @IsString()
  @Length(2, 50)
  lastName: string;

  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  emailAddress: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: string;
}

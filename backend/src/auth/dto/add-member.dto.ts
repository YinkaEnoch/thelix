import { IsString, IsEmail, IsUUID, Length, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from 'src/enums/user-role.enum';

export class AddMemberDto {
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

  @IsString()
  @IsUUID()
  organizationId: string;

  @IsEnum(UserRole)
  role: string;
}

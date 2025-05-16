import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  Length,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Define an enum for user roles (example)
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class UserDto {
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
  @Transform(({ value }) => value.trim().toLowerCase())
  organization: string;

  @IsEnum(UserRole)
  role: string;
}

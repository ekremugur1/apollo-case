import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email_address: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  company: string;
}

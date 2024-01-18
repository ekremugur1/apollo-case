import { IsEmail, IsString, MinLength } from "class-validator";

export class UserLoginDto {
  @IsEmail()
  email_address: string;

  @IsString()
  @MinLength(8)
  password: string;
}

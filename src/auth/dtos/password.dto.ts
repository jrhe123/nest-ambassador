import { IsNotEmpty } from 'class-validator';

export class PasswordDto {
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  password_confirm: string;
}

import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';

@Controller()
export class AuthController {
  @Post('admin/register')
  register(@Body() body: RegisterDto) {
    return body;
  }
}

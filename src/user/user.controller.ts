import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) // password
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('admin/ambassadors')
  async ambassadors() {
    return this.userService.find({
      is_ambassador: true,
    });
  }

  @Get('admin/ambassadors_test')
  async ambassadorsTest() {
    const password = await bcrypt.hash('123456', 12);
    //
    for (let i = 0; i < 30; i++) {
      await this.userService.save({
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        password,
        is_ambassador: true,
      });
    }
    return 'done';
  }
}

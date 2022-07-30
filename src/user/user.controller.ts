import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './user';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) // password
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('admin/ambassadors')
  async ambassadors() {
    return this.userService.find({
      is_ambassador: true,
    });
  }

  @UseGuards(AuthGuard)
  @Get('ambassador/rankings')
  async rankings() {
    const ambassadors: User[] = await this.userService.find(
      {
        is_ambassador: true,
      },
      ['orders', 'orders.order_items'],
    );
    return ambassadors.map((am) => {
      return {
        name: am.name,
        revenue: am.revenue,
      };
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

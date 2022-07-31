import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './user';
import { RedisService } from 'src/shared/redis.service';
import { Response } from 'express';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) // password
export class UserController {
  constructor(
    private readonly userService: UserService,
    private redisService: RedisService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('admin/ambassadors')
  async ambassadors() {
    return this.userService.find({
      is_ambassador: true,
    });
  }

  @UseGuards(AuthGuard)
  @Get('ambassador/rankings')
  async rankings(@Res() response: Response) {
    // const ambassadors: User[] = await this.userService.find(
    //   {
    //     is_ambassador: true,
    //   },
    //   ['orders', 'orders.order_items'],
    // );
    // return ambassadors.map((am) => {
    //   return {
    //     name: am.name,
    //     revenue: am.revenue,
    //   };
    // });

    const client = this.redisService.getClient();
    client.zrevrangebyscore(
      'rankings',
      '+inf',
      '-inf',
      'withscores',
      (err, result) => {
        let score;
        response.send(
          result.reduce((o, r) => {
            if (isNaN(parseInt(r))) {
              return {
                ...o,
                [r]: score,
              };
            } else {
              score = r;
              return o;
            }
          }, {}),
        );
      },
    );
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

  @Get('admin/ambassadors_test_2')
  async ambassadorsTest2() {
    const ambassadors: User[] = await this.userService.find(
      {
        is_ambassador: true,
      },
      ['orders', 'orders.order_items'],
    );
    // redis client to sort sets
    const client = this.redisService.getClient();
    for (let i = 0; i < ambassadors.length; i++) {
      const ambassador = ambassadors[i];
      await client.zadd('rankings', ambassador.revenue, ambassador.name);
    }
    return 'done';
  }
}

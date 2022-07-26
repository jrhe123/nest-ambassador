import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { faker } from '@faker-js/faker';
import { randomInt } from 'crypto';
import { OrderItemService } from './order-item.service';

@Controller()
export class OrderController {
  constructor(
    private orderService: OrderService,
    private orderItemService: OrderItemService,
  ) {}

  @Get('admin/orders')
  @UseInterceptors(ClassSerializerInterceptor)
  all() {
    return this.orderService.find(
      {},
      {
        order_items: true,
      },
    );
  }

  @Get('admin/orders_test')
  async ordersTest() {
    //
    for (let i = 0; i < 30; i++) {
      const order = await this.orderService.save({
        user_id: randomInt(2, 31),
        code: faker.lorem.slug(2),
        ambassador_email: faker.internet.email(),
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        complete: true,
      });
      for (let j = 0; j < randomInt(1, 5); j++) {
        await this.orderItemService.save({
          order,
          product_title: faker.lorem.words(2),
          price: randomInt(10, 100),
          quantity: randomInt(1, 5),
          admin_revenue: randomInt(10, 100),
          ambassador_revenue: randomInt(1, 10),
        });
      }
    }
    return 'done';
  }
}

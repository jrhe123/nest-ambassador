import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { faker } from '@faker-js/faker';
import { randomInt } from 'crypto';
import { OrderItemService } from './order-item.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateOrderDto } from './dtos/create-order.dto';
import { LinkService } from 'src/link/link.service';
import { Order } from './order';
import { Link } from 'src/link/link';
import { ProductService } from 'src/product/product.service';
import { OrderItem } from './order-item';
import { Product } from 'src/product/product';

@Controller()
export class OrderController {
  constructor(
    private orderService: OrderService,
    private orderItemService: OrderItemService,
    private linkService: LinkService,
    private productService: ProductService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('admin/orders')
  @UseInterceptors(ClassSerializerInterceptor)
  all() {
    return this.orderService.find(
      {
        // id: 1,
      },
      ['order_items'],
    );
  }

  @Post('checkout/orders')
  async create(@Body() body: CreateOrderDto) {
    const link: Link = await this.linkService.findOne(
      {
        code: body.code,
      },
      ['user'],
    );
    if (!link) {
      throw new BadRequestException('Invalid link');
    }
    // order
    const o = new Order();
    o.user_id = link.user.id;
    o.ambassador_email = link.user.email;
    o.first_name = body.first_name;
    o.last_name = body.last_name;
    o.email = body.email;
    o.address = body.address;
    o.country = body.country;
    o.city = body.city;
    o.zip = body.zip;
    o.code = body.code;
    const order = await this.orderService.save(o);
    // products
    for (const p of body.products) {
      const product: Product = await this.productService.findOne({
        id: p.product_id,
      });
      const orderItem = new OrderItem();
      orderItem.order = order;
      orderItem.product_title = product.title;
      orderItem.price = product.price;
      orderItem.quantity = p.quantity;
      orderItem.ambassador_revenue = 0.1 * product.price * p.quantity;
      orderItem.admin_revenue = 0.9 * product.price * p.quantity;
      await this.orderItemService.save(orderItem);
    }
    //
    return order;
  }

  @Get('admin/test_query_builder')
  async test() {
    const result = await this.orderService.test3();
    return {
      result,
    };
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

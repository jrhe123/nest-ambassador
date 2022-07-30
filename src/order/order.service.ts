import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/shared/abstract.service';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order';

@Injectable()
export class OrderService extends AbstractService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private dataSource: DataSource,
  ) {
    super(orderRepository);
  }

  // https://typeorm.io/select-query-builder
  async test() {
    const order = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .where('order.id = :id', { id: 1 })
      .getOne();
    return order;
  }

  async test2() {
    const order = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .orderBy('order.id')
      .innerJoinAndSelect(
        'order.order_items',
        'order_items',
        'order_items.price = :price', // optional
        { price: 99 }, // optional
      )
      .where('order.id = :id', { id: 1 })
      .getOne();
    return order;
  }

  async test3() {
    const orderItems = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      // .select(["user.id", "user.name"]) // partial selection
      // .useIndex('my_index') // name of index
      .leftJoinAndSelect(
        'order_items',
        'order_item',
        'order_item.order_id = order.id',
      )
      .skip(10)
      .take(10)
      .getMany();
    return orderItems;
  }
}

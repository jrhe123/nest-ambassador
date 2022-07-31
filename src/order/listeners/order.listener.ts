import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from 'src/shared/redis.service';
import { Order } from '../order';

@Injectable()
export class OrderListener {
  constructor(private redisService: RedisService) {}

  @OnEvent('order.completed')
  async handleOrderCompletedEvent(order: Order) {
    const client = this.redisService.getClient();
    client.zincrby('rankings', order.ambassador_revenue, order.user.name);
  }
}

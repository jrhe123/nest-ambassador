import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkModule } from 'src/link/link.module';
import { ProductModule } from 'src/product/product.module';
import { SharedModule } from 'src/shared/shared.module';
import { Order } from './order';
import { OrderItem } from './order-item';
import { OrderItemService } from './order-item.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    SharedModule,
    LinkModule,
    ProductModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderItemService],
  exports: [OrderService, OrderItemService],
})
export class OrderModule {}

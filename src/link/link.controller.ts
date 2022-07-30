import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { Order } from 'src/order/order';
import { Link } from './link';
import { LinkService } from './link.service';

@Controller()
export class LinkController {
  constructor(
    private linkService: LinkService,
    private authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('admin/users/:id/links')
  async all(@Param('id') id: number) {
    return this.linkService.find(
      {
        user: Number(id),
      },
      ['orders'],
    );
  }

  @UseGuards(AuthGuard)
  @Post('ambassador/links')
  async create(@Body('products') products: number[], @Req() request: Request) {
    const user = await this.authService.user(request);
    return this.linkService.save({
      code: Math.random().toString(36).substr(6),
      user,
      products: products.map((id) => {
        return { id };
      }),
    });
  }

  @UseGuards(AuthGuard)
  @Get('ambassador/stats')
  async stats(@Req() request: Request) {
    const user = await this.authService.user(request);
    const links: Link[] = await this.linkService.find(
      {
        user,
      },
      ['orders'],
    );
    return links.map((li) => {
      const completedOrders: Order[] = li.orders.filter((o) => o.complete);
      return {
        code: li.code,
        count: completedOrders.length,
        revenue: completedOrders.reduce(
          (s, o) => (s += o.ambassador_revenue),
          0,
        ),
      };
    });
  }
}

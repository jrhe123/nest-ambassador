import {
  Body,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  CACHE_MANAGER,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';
import { faker } from '@faker-js/faker';
import { randomInt } from 'crypto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { Product } from './product';

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventEmitter: EventEmitter2,
  ) {}

  @UseGuards(AuthGuard)
  @Get('admin/products')
  async all() {
    return this.productService.find({});
  }

  @UseGuards(AuthGuard)
  @Post('admin/products')
  async create(@Body() body: ProductCreateDto) {
    const product = await this.productService.save(body);
    // emit event
    this.eventEmitter.emit('product_updated');
    return product;
  }

  @UseGuards(AuthGuard)
  @Get('admin/products/:id')
  async get(@Param('id') id: number) {
    return this.productService.findOne({
      id,
    });
  }

  @UseGuards(AuthGuard)
  @Put('admin/products/:id')
  async update(@Param('id') id: number, @Body() body: ProductCreateDto) {
    await this.productService.update(id, body);
    // emit event
    this.eventEmitter.emit('product_updated');
    //
    return this.productService.findOne({
      id,
    });
  }

  @UseGuards(AuthGuard)
  @Delete('admin/products/:id')
  async delete(@Param('id') id: number) {
    const response = await this.productService.delete(id);
    // emit event
    this.eventEmitter.emit('product_updated');
    return response;
  }

  @CacheKey('products_frontend')
  @CacheTTL(30 * 60) // 30mins expiration
  @UseInterceptors(CacheInterceptor)
  @Get('ambassador/products/frontend')
  async frontend() {
    return this.productService.find();
  }

  @Get('ambassador/products/backend')
  async backend(@Req() request: Request) {
    // check cache
    let products = await this.cacheManager.get<Product[]>('products_backend');
    if (!products) {
      // get from db
      products = await this.productService.find();
      // set cache
      await this.cacheManager.set('products_backend', products, {
        ttl: 30 * 60,
      });
    }
    // fake search
    if (request.query.s) {
      const s = request.query.s.toString().toLocaleLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLocaleLowerCase().indexOf(s) !== -1 ||
          p.description.toLocaleLowerCase().indexOf(s) !== -1,
      );
    }
    // fake sort
    if (request.query.sort === 'asc' || request.query.sort === 'desc') {
      const isAsc = request.query.sort === 'asc';
      products.sort((a, b) => {
        const diff = a.price - b.price;
        if (diff === 0) return 0;
        const sign = Math.abs(diff) / diff;
        return isAsc ? sign : -sign;
        // 0, -1, 1
      });
    }
    // fake pagination
    const page: number = parseInt(request.query.page as string) || 1;
    const perPage = 9;
    const total = products.length;
    const data = products.slice(perPage * (page - 1), perPage * page);
    //
    return {
      data,
      total,
      page,
      last_page: Math.ceil(total / perPage),
    };
  }

  @Get('admin/products_test')
  async productsTest() {
    //
    for (let i = 0; i < 30; i++) {
      await this.productService.save({
        title: faker.lorem.words(2),
        description: faker.lorem.words(10),
        image: faker.image.imageUrl(200, 200, '', true),
        price: randomInt(10, 100),
      });
    }
    return 'done';
  }
}

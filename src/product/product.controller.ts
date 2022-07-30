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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';
import { faker } from '@faker-js/faker';
import { randomInt } from 'crypto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Cache } from 'cache-manager';

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @UseGuards(AuthGuard)
  @Get('admin/products')
  async all() {
    return this.productService.find({});
  }

  @UseGuards(AuthGuard)
  @Post('admin/products')
  async create(@Body() body: ProductCreateDto) {
    return this.productService.save(body);
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
    return this.productService.findOne({
      id,
    });
  }

  @UseGuards(AuthGuard)
  @Delete('admin/products/:id')
  async delete(@Param('id') id: number) {
    return this.productService.delete(id);
  }

  @CacheKey('products_frontend')
  @CacheTTL(30 * 60) // 30mins expiration
  @UseInterceptors(CacheInterceptor)
  @Get('ambassador/products/frontend')
  async frontend() {
    return this.productService.find();
  }

  @Get('ambassador/products/backend')
  async backend() {
    // check cache
    let products = await this.cacheManager.get('products_backend');
    if (!products) {
      // get from db
      products = await this.productService.find();
      // set cache
      await this.cacheManager.set('products_backend', products, {
        ttl: 30 * 60,
      });
    }
    return products;
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

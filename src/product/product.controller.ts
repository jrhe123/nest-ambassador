import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';
import { faker } from '@faker-js/faker';
import { randomInt } from 'crypto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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

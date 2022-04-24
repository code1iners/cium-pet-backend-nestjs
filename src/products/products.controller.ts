import { ProductsService } from './products.service';
import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list() {
    return [];
  }

  @Get('/:id')
  retrieve(@Param('id') id: number) {
    return `Will be retrieve a product item ${id}`;
  }

  @Post()
  create() {
    return 'Will be create a product.';
  }

  @Patch('/:id')
  update(@Param('id') id: number) {
    return `Will be update a product item. ${id}`;
  }

  @Delete('/:id')
  delete(@Param('id') id: number) {
    return `Will be delete a product item. ${id}`;
  }
}

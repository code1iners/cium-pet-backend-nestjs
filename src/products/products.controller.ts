import { ProductUpdateDto } from '@/products/dtos/product-update.dto';
import { ProductCreateDto } from '@/products/dtos/product-create.dto';
import { ProductsService } from '@/products/products.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list() {
    return this.productsService.getProducts();
  }

  @Get('/:id')
  retrieve(@Param('id') id: number) {
    return this.productsService.getProductById(id);
  }

  @Post()
  create(@Body() product: ProductCreateDto) {
    return this.productsService.createProduct(product);
  }

  @Patch('/:id')
  update(@Param('id') id: number, @Body() product: ProductUpdateDto) {
    return this.productsService.updateProductById(id, product);
  }

  @Delete('/:id')
  delete(@Param('id') id: number) {
    return this.productsService.deleteProductById(id);
  }
}

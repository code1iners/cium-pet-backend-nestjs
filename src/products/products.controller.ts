import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProductUpdateDto } from '@/products/dtos/product-update.dto';
import { ProductCreateDto } from '@/products/dtos/product-create.dto';
import { ProductsService } from '@/products/products.service';

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
  async create(
    @Body() product: ProductCreateDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      if (!Object.keys(product).length) {
        return response.status(400).json({
          ok: false,
          error: {
            code: '002',
            message:
              'Product create dto(name, description, price, image, category) is required.',
          },
        });
      }
      const newProduct = {
        sellerId: request.session.loggedInUser.id,
        ...product,
      };
      const res = await this.productsService.createProduct(newProduct);
      console.log(res);

      return response.status(201).json({
        ok: true,
      });
    } catch (e) {
      console.error('[create]', e?.message ?? e);
      return response.status(500).json({
        ok: false,
        error: {
          code: '001',
          message: 'Failed create product new one.',
        },
      });
    }
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

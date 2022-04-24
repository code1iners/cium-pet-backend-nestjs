import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from '@libs/prisma.service';
import { ProductCreateDto } from '@/products/dtos/product-create.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly client: PrismaService) {}

  async getProducts(): Promise<Product[]> {
    return this.client.product.findMany();
  }

  async getProductById(id: number): Promise<Product> {
    return this.client.product.findUnique({ where: { id } });
  }

  async createProduct(product: ProductCreateDto): Promise<Product> {
    const { name, description, price, image, option, category, sellerId } =
      product;
    try {
      return this.client.product.create({
        data: {
          name,
          description,
          price,
          image,
          option,
          category,
          seller: {
            connect: {
              id: sellerId,
            },
          },
        },
      });
    } catch (e) {
      console.error('[createProduct]', e?.message ?? e);
    }
  }

  async deleteProductById(id: number): Promise<boolean> {
    await this.client.product.delete({ where: { id } });
    return true;
  }

  async updateProductById(id: number, product: any): Promise<Product> {
    return this.client.product.update({
      where: { id },
      data: {
        ...product,
      },
    });
  }
}

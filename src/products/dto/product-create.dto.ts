import { ProductCategory } from '.prisma/client';

export class ProductCreateDto {
  name: string;
  description: string;
  price: number;
  image: string;
  option?: string;
  category: ProductCategory;
}

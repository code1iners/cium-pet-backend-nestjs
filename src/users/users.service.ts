import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/libs/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly client: PrismaService) {}

  async getUsers() {
    return this.client.user.findMany();
  }

  async getUserById(id: number) {
    return this.client.user.findUnique({ where: { id } });
  }
}

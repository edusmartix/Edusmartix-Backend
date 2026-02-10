import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Prisma, User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Use PrismaUser here
  async createUser(data: Prisma.UserCreateInput): Promise<PrismaUser> {
    return await this.prisma.user.create({ data });
  }

  // Use PrismaUser here
  async findByEmail(email: string): Promise<PrismaUser | null> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  // Use PrismaUser here
  async findById(id: number): Promise<PrismaUser | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  // Use PrismaUser here
  async updateStatus(id: number, isActive: boolean): Promise<PrismaUser> {
    return await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }
}

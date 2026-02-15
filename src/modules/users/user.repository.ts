import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Prisma, User as PrismaUser, ParentRelationship } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Use PrismaUser here
  async createUser(data: Prisma.UserCreateInput): Promise<PrismaUser> {
    return await this.prisma.user.create({ data });
  }

  // Use PrismaUser here
  // async findByEmail(email: string): Promise<PrismaUser | null> {
  //   return await this.prisma.user.findUnique({ where: { email } });
  // }

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

  async findByEmail(email: string, tx?: Prisma.TransactionClient) {
    return (tx || this.prisma).user.findUnique({ where: { email } });
  }

  async upsertUser(
    data: Prisma.UserCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).user.upsert({
      where: { email: data.email },
      update: {}, // We keep the first-ever name as the global identity
      create: data,
    });
  }

  async createStaffProfile(
    data: Prisma.StaffProfileUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).staffProfile.create({ data });
  }

  async upsertParentProfile(
    data: Prisma.ParentProfileUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).parentProfile.upsert({
      where: {
        userId_schoolId: { userId: data.userId, schoolId: data.schoolId },
      },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: data.passwordHash,
      },
      create: data,
    });
  }

  async createStudent(
    data: Prisma.StudentUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).student.create({ data });
  }

  async linkParentStudent(
    parentProfileId: number,
    studentId: number,
    relationship: ParentRelationship,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).parentStudent.create({
      data: { parentProfileId, studentId, relationship },
    });
  }
}

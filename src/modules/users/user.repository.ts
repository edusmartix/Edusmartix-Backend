import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Prisma, User as PrismaUser, ParentRelationship } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- GLOBAL USER METHODS ---

  async createUser(
    data: Prisma.UserCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaUser> {
    return await (tx || this.prisma).user.create({ data });
  }

  async findById(id: number): Promise<PrismaUser | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string, tx?: Prisma.TransactionClient) {
    return (tx || this.prisma).user.findUnique({ where: { email } });
  }

  async updateStatus(id: number, isActive: boolean): Promise<PrismaUser> {
    return await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  async upsertUser(
    data: Prisma.UserCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).user.upsert({
      where: { email: data.email },
      update: {}, // Keep existing identity if they already exist globally
      create: data,
    });
  }

  // --- STAFF METHODS ---

  async createStaffProfile(
    data: Prisma.StaffProfileUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).staffProfile.create({ data });
  }

  // --- PARENT METHODS ---

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

  // --- STUDENT METHODS ---

  async createStudent(
    data: Prisma.StudentUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).student.create({ data });
  }

  /**
   * Helper for Student Portal login.
   * Finds the student by admission number + school context
   */
  async findStudentByAdmission(schoolId: number, admissionNo: string) {
    return this.prisma.student.findUnique({
      where: {
        schoolId_admissionNo: { schoolId, admissionNo },
      },
      include: { user: true }, // Include global user to check email/id
    });
  }

  /**
   * Allows re-registering a student who might have been deleted/archived
   */
  async upsertStudent(
    data: Prisma.StudentUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).student.upsert({
      where: {
        schoolId_admissionNo: {
          schoolId: data.schoolId,
          admissionNo: data.admissionNo,
        },
      },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: data.passwordHash,
        isActive: data.isActive ?? true,
      },
      create: data,
    });
  }

  // --- STAFF METHODS ---

  async findAllStaff(schoolId: number) {
    return this.prisma.staffProfile.findMany({
      where: { schoolId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true, // This is the StaffRole (ADMIN, TEACHER, etc.)
        userId: true,
        user: { select: { email: true, isActive: true } },
      },
      orderBy: { role: 'asc' },
    });
  }

  async findStaffById(staffId: number) {
    return this.prisma.staffProfile.findUnique({
      where: { id: staffId },
      include: { user: { select: { email: true, isActive: true } } },
    });
  }

  // --- STUDENT METHODS ---

  async findAllStudents(schoolId: number) {
    return this.prisma.student.findMany({
      where: { schoolId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNo: true,
        gender: true,
        isActive: true,
        userId: true,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async findStudentById(studentId: number) {
    return this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { email: true } },
        enrollments: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { classArm: { include: { classLevel: true } } },
        },
      },
    });
  }
}

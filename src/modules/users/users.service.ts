import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateStudentParentDto } from './dto/create-student-parent.dto';
import { UserRepository } from './user.repository';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private userRepo: UserRepository,
  ) {}

  private generateTemporaryPassword(): string {
    return randomBytes(4).toString('hex'); // Simple 8-character password
  }

  async createStaff(schoolId: number, dto: CreateStaffDto) {
    const tempPassword = this.generateTemporaryPassword();
    const hashedPass = await bcrypt.hash(tempPassword, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await this.userRepo.upsertUser(
        {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: UserRole.STAFF,
        },
        tx,
      );

      const staffProfile = await this.userRepo.createStaffProfile(
        {
          userId: user.id,
          schoolId: schoolId,
          firstName: dto.firstName, // Profile Override
          lastName: dto.lastName, // Profile Override
          passwordHash: hashedPass,
          role: dto.staffRole,
        },
        tx,
      );

      console.log(
        `[AUTH] Staff Created. Email: ${dto.email} | Temp Pass: ${tempPassword} | School: ${schoolId}`,
      );
      return {
        userId: staffProfile.userId,
        staffId: staffProfile.id,
        schoolId: schoolId,
        firstName: staffProfile.firstName,
        lastName: staffProfile.lastName,
        StaffRole: staffProfile.role,
        credentials: { email: user.email, password: tempPassword },
      };
    });
  }

  async createStudentWithParent(schoolId: number, dto: CreateStudentParentDto) {
    const parentTempPass = this.generateTemporaryPassword();
    const studentTempPass = this.generateTemporaryPassword();

    const parentHash = await bcrypt.hash(parentTempPass, 10);
    const studentHash = await bcrypt.hash(studentTempPass, 10);

    return this.prisma.$transaction(async (tx) => {
      // 1. PARENT SIDE
      const parentUser = await this.userRepo.upsertUser(
        {
          email: dto.parentEmail,
          firstName: dto.parentFirstName,
          lastName: dto.parentLastName,
          role: UserRole.PARENT, // Global role is just USER
        },
        tx,
      );

      const parentProfile = await this.userRepo.upsertParentProfile(
        {
          userId: parentUser.id,
          schoolId,
          firstName: dto.parentFirstName,
          lastName: dto.parentLastName,
          passwordHash: parentHash,
        },
        tx,
      );

      // 2. STUDENT SIDE (New: Create the User Identity first)
      // If students don't have emails, you can use: admissionNo@schoolslug.com
      const studentUser = await this.userRepo.upsertUser(
        {
          email: dto.studentEmail || `${dto.admissionNo}@edu.com`,
          firstName: dto.studentFirstName,
          lastName: dto.studentLastName,
          role: UserRole.STUDENT,
        },
        tx,
      );

      const student = await this.userRepo.createStudent(
        {
          userId: studentUser.id, // Linked to the User table!
          schoolId,
          firstName: dto.studentFirstName,
          lastName: dto.studentLastName,
          admissionNo: dto.admissionNo,
          gender: dto.gender,
          passwordHash: studentHash,
        },
        tx,
      );

      // 3. Junction Link
      await this.userRepo.linkParentStudent(
        parentProfile.id,
        student.id,
        dto.relationship,
        tx,
      );

      return {
        studentId: student.id,
        parentId: parentUser.id,
        studentUser: studentUser.email,
        parentUser: parentUser.email,
        credentials: {
          student: { email: studentUser.email, password: studentTempPass },
          parent: { email: parentUser.email, password: parentTempPass },
        },
      };
    });
  }
}

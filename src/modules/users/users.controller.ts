import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UserService } from './users.service';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorators';
import { UserRole } from '@prisma/client';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateStudentParentDto } from './dto/create-student-parent.dto';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard) // Order matters!
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('staff')
  @Roles(UserRole.SCHOOL_OWNER)
  async createStaff(@Req() req, @Body() dto: CreateStaffDto) {
    return this.userService.createStaff(req['schoolId'], dto);
  }

  @Post('student-parent')
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
  async createStudent(@Req() req, @Body() dto: CreateStudentParentDto) {
    return this.userService.createStudentWithParent(req['schoolId'], dto);
  }
}

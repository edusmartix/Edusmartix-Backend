import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { Roles } from '../../core/common/decorators/roles.decorators';
import { UserRole } from '@prisma/client';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateStudentParentDto } from './dto/create-student-parent.dto';

@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard) // Order matters!
export class UsersController {
  constructor(private readonly userService: UsersService) {}

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

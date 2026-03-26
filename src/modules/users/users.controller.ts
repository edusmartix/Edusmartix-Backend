import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  Get,
  Param,
} from '@nestjs/common';
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

  @Get('staff')
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF) // Admins/Owners can see list
  async getStaffList(@Req() req) {
    return this.userService.getAllStaffGrouped(req['schoolId']);
  }

  @Get('staff/:id')
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
  async getStaff(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getStaffDetail(id);
  }

  @Get('students')
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
  async getStudentList(@Req() req) {
    return this.userService.getAllStudents(req['schoolId']);
  }

  @Get('students/:id')
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
  async getStudent(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getStudentDetail(id);
  }

  @Get('dashboard/stats')
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
  async getStats(@Req() req) {
    return this.userService.getDashboardStats(req['schoolId']);
  }
}

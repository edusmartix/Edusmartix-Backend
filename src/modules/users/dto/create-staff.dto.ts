import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { StaffRole } from '@prisma/client';

export class CreateStaffDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(StaffRole)
  staffRole: StaffRole;
}

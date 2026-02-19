import { IsEnum, IsInt, IsArray } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';
import { IsOptional } from 'class-validator';
export class BulkEnrollDto {
  @IsInt()
  classArmId: number;

  @IsArray()
  @IsInt({ each: true })
  studentIds: number[];

  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;
}

import { AttendanceStatus } from '@prisma/client';
import {
  IsInt,
  IsDateString,
  IsArray,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecordInputDto {
  @IsInt()
  enrollmentId: number;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class MarkAttendanceDto {
  @IsInt()
  classArmId: number;

  @IsDateString()
  date: string; // The date being marked

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordInputDto)
  records: RecordInputDto[];
}

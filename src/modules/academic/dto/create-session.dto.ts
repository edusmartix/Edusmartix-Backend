import {
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { SessionStatus } from '@prisma/client';

export class CreateSessionDto {
  @IsString()
  name: string; // e.g., "2025/2026 Academic Session"

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(SessionStatus)
  status: SessionStatus;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;
}

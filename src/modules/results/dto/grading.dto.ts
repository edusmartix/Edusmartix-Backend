import {
  IsInt,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GradeBoundaryDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  maxScore: number;

  @IsString()
  grade: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsInt()
  orderIndex: number;

  @IsNumber()
  @IsOptional()
  gradePoint?: number;
}

export class UpdateGradingDto {
  @IsInt()
  scaleId: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeBoundaryDto)
  boundaries: GradeBoundaryDto[];
}

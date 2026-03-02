import {
  IsInt,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SkillItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number;

  @IsInt()
  @Min(1)
  orderIndex: number;
}

export class SkillCategoryDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  orderIndex: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillItemDto)
  items: SkillItemDto[];
}

export class UpdateSkillLevelDto {
  @IsInt()
  classLevelId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillCategoryDto)
  categories: SkillCategoryDto[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  targetClassLevelIds?: number[];
}

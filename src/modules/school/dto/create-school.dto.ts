import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateSchoolDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  suffix?: string; // Add this to fix the ts(2339) error

  @IsNotEmpty()
  ownerUserId: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  schoolType?: string;
}

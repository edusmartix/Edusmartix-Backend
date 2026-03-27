import { IsEmail, IsString, IsOptional } from 'class-validator';

export class SubscribeNewsletterDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  schoolName: string;

  @IsOptional()
  @IsString()
  whatsapp: string;
}

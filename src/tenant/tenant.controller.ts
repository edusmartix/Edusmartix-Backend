import {
  Controller,
  Get,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * Public endpoint for the frontend to fetch branding
   * based on the current hostname.
   */
  @Get('identify')
  async identify(@Headers('x-school-domain') domain: string) {
    // Explicitly check if the frontend sent the header
    if (!domain) {
      throw new BadRequestException('x-school-domain header is missing');
    }
    // We reuse the service logic which handles Redis caching
    const tenant = await this.tenantService.getTenantByDomain(domain);

    return {
      success: true,
      data: {
        schoolId: tenant.schoolId,
        portalType: tenant.portalType,
        branding: {
          name: tenant.branding.name,
          logoUrl: tenant.branding.logoUrl,
          primaryColor: tenant.branding.primaryColor,
          secondaryColor: tenant.branding.secondaryColor,
        },
      },
    };
  }

  @Get('check-availability')
  async checkAvailability(@Query('domain') domain: string) {
    if (!domain) {
      throw new BadRequestException('Domain is missing in query');
    }
    const isAvailable = await this.tenantService.isDomainAvailable(domain);
    return { available: isAvailable };
  }

  @Get('check-slug')
  async checkSlug(
    @Query('slug') slug: string,
    @Query('suffix') suffix?: string, // Optional: defaults to .edusmartix.com
  ) {
    if (!slug) {
      throw new BadRequestException('slug is missing in query');
    }
    return await this.tenantService.checkSlugAvailability(slug, suffix);
  }
}

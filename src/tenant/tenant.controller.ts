import { Controller, Get, Query } from '@nestjs/common';
import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * Public endpoint for the frontend to fetch branding
   * based on the current hostname.
   */
  @Get('identify')
  async identify(@Query('domain') domain: string) {
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
    const isAvailable = await this.tenantService.isDomainAvailable(domain);
    return { available: isAvailable };
  }
}

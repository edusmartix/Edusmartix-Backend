import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const domain = req.headers['x-school-domain'] as string;

    if (domain) {
      try {
        const tenant = await this.tenantService.getTenantByDomain(domain);
        req['schoolId'] = tenant.schoolId;
        req['domainType'] = tenant.domainType;
      } catch (e) {
        console.log(
          `Tenant lookup failed for domain: ${domain} - ${e.message}`,
        );
        // We let the request continue;
        // Guards will block access to protected routes if schoolId is missing
      }
    }
    next();
  }
}

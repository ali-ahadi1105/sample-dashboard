import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (user.role === 'SUPER_ADMIN') {
      return true; // Super admins can access any tenant records
    }

    // Get tenantId from params, body or query
    const resourceTenantId = request.params.tenantId || request.body.tenantId || request.query.tenantId;

    if (!resourceTenantId) {
      // If the route exposes a global resource or relies strictly on user.tenantId via code, let it pass.
      // But typically, restrict to routes having explicit tenantId.
      return true; 
    }

    return user.tenantId === resourceTenantId;
  }
}

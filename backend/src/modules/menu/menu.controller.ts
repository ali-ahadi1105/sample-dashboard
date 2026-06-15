import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':tenantId')
  @ApiOperation({ summary: 'Get Customer Facing Menu (Cached)' })
  async getCustomerMenu(@Param('tenantId') tenantId: string) {
    return this.menuService.getCustomerMenu(tenantId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles(Role.RESTAURANT_ADMIN, Role.SUPER_ADMIN)
  @Patch(':tenantId/items/:itemId')
  @ApiOperation({ summary: 'Update menu item and invalidate cache' })
  async updateMenuItem(
    @Param('tenantId') tenantId: string,
    @Param('itemId') itemId: string,
    @Body() payload: any, // Expected to be mapped to a validate DTO class
  ) {
    return this.menuService.updateMenuItem(tenantId, itemId, payload);
  }
}

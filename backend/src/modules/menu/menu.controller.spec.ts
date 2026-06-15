import { Test, TestingModule } from '@nestjs/testing';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

describe('MenuController', () => {
  let controller: MenuController;
  let menuServiceMock: Partial<MenuService>;

  beforeEach(async () => {
    menuServiceMock = {
      getCustomerMenu: jest.fn(),
      updateMenuItem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: menuServiceMock,
        },
      ],
    }).compile();

    controller = module.get<MenuController>(MenuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCustomerMenu', () => {
    it('should return menu for tenant', async () => {
      const tenantId = 'tenant1';
      const mockMenu = [{ id: 'cat1', name: 'Category 1' }];
      (menuServiceMock.getCustomerMenu as jest.Mock).mockResolvedValue(mockMenu);

      const result = await controller.getCustomerMenu(tenantId);
      expect(result).toEqual(mockMenu);
      expect(menuServiceMock.getCustomerMenu).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('updateMenuItem', () => {
    it('should update menu item', async () => {
      const tenantId = 'tenant1';
      const itemId = 'item1';
      const payload = { name: 'Item 1' };
      const expectedResult = { success: true, updatedItemId: itemId };

      (menuServiceMock.updateMenuItem as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.updateMenuItem(tenantId, itemId, payload);
      expect(result).toEqual(expectedResult);
      expect(menuServiceMock.updateMenuItem).toHaveBeenCalledWith(tenantId, itemId, payload);
    });
  });
});

import { DBService } from "../../common";
import { Restaurant } from "../../db/models";
import { NotFoundError, BadRequestError } from "../../common";

class MenuService extends DBService<any> {
  constructor() {
    super(Restaurant);
  }

  async getAllRestaurants() {
    try {
      return await this.getAll();
    } catch (error) {
      throw new BadRequestError("Failed to fetch restaurants");
    }
  }

  async getRestaurantById(id: string) {
    try {
      return await this.getById(id);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to fetch restaurant");
    }
  }

  async getMenuItems(restaurantId: string) {
    try {
      const restaurant = await this.getById(restaurantId);
      return restaurant.menu || [];
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to fetch menu items");
    }
  }

  async getMenuItem(restaurantId: string, itemId: string) {
    try {
      const restaurant = await this.getById(restaurantId);
      const item = restaurant.menu?.id(itemId);
      if (!item) throw new NotFoundError("Menu item");
      return item;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to fetch menu item");
    }
  }
}

export const menuService = new MenuService();
